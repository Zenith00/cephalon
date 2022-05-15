import React, { useEffect, useReducer, useState } from "react";
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Button,
  Container,
  Footer,
  Group,
  Header,
  Modal,
  Popover,
  Space,
  TextInput,
  Title,
  Text,
} from "@mantine/core";
import DamageGraphsAside from "@damage/DamageGraphs/DamageGraphsAside";
import { useRouter } from "next/router";
import * as HTMLToImage from "html-to-image";
import { gzip } from "pako";

import PlayerCard, {
  AdvantageType,
  Damager,
  Player,
} from "@/damage/DamagerCard/PlayerCard";
import TargetNavbar from "@/damage/Target.navbar";
import { dummyDamageData, useHandleDamageData } from "@/damage/damageData.hook";
import { useDebouncedCallback } from "use-debounce";
import { PRESET_DAMAGERS } from "@/damage/constants";
import playerCard from "@/damage/DamagerCard/PlayerCard";

import "./Damage.module.css";
import { Clipboard, Link } from "tabler-icons-react";

export interface Target {
  ac: number;
}

const PLAYER_FIELD_TO_SHORT: Record<keyof Player, string> = {
  key: "k",
  attackBonus: "a",
  spellSaveDC: "s",
  elvenAccuracy: "e",
  battleMaster: "b",
  damagers: "d",
  critThreshold: "c",
};
const PLAYER_SHORT_TO_FIELD = Object.fromEntries(
  Object.entries(PLAYER_FIELD_TO_SHORT).map(([k, v]) => [v, k])
);

console.log(PLAYER_SHORT_TO_FIELD);

// const PLAYER_FIELD_TO_SHORT = new Map(
//   [...PLAYER_SHORT_TO_FIELD.entries()].map(([k, v]) => [v, k])
// );

const DAMAGER_FIELD_TO_SHORT: Record<keyof Damager, string> = {
  damage: "dmg",
  damageMean: "dm",
  advantageShow: "as",
  modifiers: "m",
  modifierOptions: "mo",
  modifierRaws: "mr",
  atkBase: "a",
  name: "n",
  disabled: "di",
  key: "k",
  count: "c",
};

const DAMAGER_SHORT_TO_FIELD = Object.fromEntries(
  Object.entries(DAMAGER_FIELD_TO_SHORT).map(([k, v]) => [v, k])
) as Record<string, keyof Damager>;

// const DAMAGER_FIELD_TO_SHORT = new Map(
//   [...DAMAGER_SHORT_TO_FIELD.entries()].map(([k, v]) => [v, k])
// );

function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key: string, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

export const DamageDataContext =
  React.createContext<DamageData>(dummyDamageData);

export const DispatchPlayerList =
  React.createContext<React.Dispatch<playerListReducerAction> | null>(null);

export const SelectedPlayerContext = React.createContext<number>(0);
export const PlayerContext = React.createContext<Player | null>(null);
export const InitialPlayerListContext = React.createContext<PlayerList>({});
export const SetModalContext = React.createContext<(e: React.FC) => void>(
  () => {}
);

const MemoDamageGraphs = React.memo(DamageGraphsAside);

const MemoPlayerCard = React.memo(PlayerCard);

export type PlayerList = { [key: number]: Player };
export type DamageData = Map<
  number,
  Map<number, Map<AdvantageType, Map<number, number>>>
>;

export type playerListReducerFieldSet = (
  | {
      field: "id";
      val: number;
    }
  | {
      field: "attackBonus";
      val: number;
    }
  | {
      field: "spellSaveDC";
      val: number;
    }
  | {
      field: "elvenAccuracy";
      val: boolean;
    }
  | {
      field: "battleMaster";
      val: boolean;
    }
  | {
      field: "damagers";
      val: { [key: number]: Damager };
    }
  | {
      field: "critThreshold";
      val: number;
    }
) & { playerKey: number };

export type playerListReducerAction =
  | {
      field: "OVERWRITE";
      val: PlayerList;
    }
  | {
      field: "NEW_DAMAGER";
      playerKey: number;
    }
  | {
      field: "PRESET_DAMAGER";
      playerKey: number;
      newDamagerName: keyof typeof PRESET_DAMAGERS;
    }
  | {
      field: "COPY_DAMAGER";
      playerKey: number;
      newDamager: Damager;
    }
  | {
      field: "UPDATE_DAMAGER";
      playerKey: number;
      damagerKey: number;
      newDamager: Damager;
    }
  | { field: "DELETE_DAMAGER"; playerKey: number; damagerKey: number }
  | playerListReducerFieldSet;

const transformPlayerList = (p: PlayerList, inflate: boolean) => {
  console.log(p);
  const PLAYER_MAP = inflate ? PLAYER_SHORT_TO_FIELD : PLAYER_FIELD_TO_SHORT;
  const DAMAGER_MAP = inflate ? DAMAGER_SHORT_TO_FIELD : DAMAGER_FIELD_TO_SHORT;
  const DAMAGERS_KEY = inflate ? "damagers" : "d";
  return Object.fromEntries(
    [...Object.entries(p)].map(([playerIndex, player]) => [
      playerIndex,
      Object.fromEntries(
        Object.entries(player).map(([playerField, playerValue]) => {
          if (["damagers", "d"].includes(playerField)) {
            return [
              DAMAGERS_KEY,
              Object.fromEntries(
                Object.entries(playerValue as { [key: number]: Damager }).map(
                  ([damagerIndex, damager]) => [
                    damagerIndex,
                    Object.fromEntries(
                      Object.entries(damager).map(
                        ([damagerKey, damagerVal]) => [
                          DAMAGER_MAP[damagerKey as keyof Damager],
                          damagerVal,
                        ]
                      )
                    ),
                  ]
                )
              ),
            ];
          } else {
            return [PLAYER_MAP[playerField], playerValue];
          }
        })
      ),
    ])
  );
};

const Damage = () => {
  const router = useRouter();
  const [hideGraphs, setHideGraphs] = useState(false);

  const playerListReducer = (
    state: { [key: number]: Player },
    action: playerListReducerAction
  ): PlayerList => {
    console.log(state);
    console.log(action);
    const getNextDamagerIndex = (playerKey: number) =>
      Math.max(
        ...Object.keys(state[playerKey].damagers).map((i) => parseInt(i)),
        -1
      ) + 1;

    if (action.field === "OVERWRITE") {
      return action.val;
    } else if (action.field === "UPDATE_DAMAGER") {
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [action.damagerKey]: action.newDamager,
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } else if (action.field === "NEW_DAMAGER") {
      const nextDamagerIndex = getNextDamagerIndex(action.playerKey);
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [nextDamagerIndex]: new Damager(nextDamagerIndex),
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } else if (action.field === "PRESET_DAMAGER") {
      const nextDamagerIndex = getNextDamagerIndex(action.playerKey);
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [nextDamagerIndex]:
          PRESET_DAMAGERS[action.newDamagerName](nextDamagerIndex),
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } else if (action.field === "COPY_DAMAGER") {
      const nextDamagerIndex = getNextDamagerIndex(action.playerKey);
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [nextDamagerIndex]: { ...action.newDamager, key: nextDamagerIndex },
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } else if (action.field === "DELETE_DAMAGER") {
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: Object.fromEntries(
            Object.entries(state[action.playerKey].damagers).filter(
              ([k, v]) => parseInt(k) !== action.damagerKey
            )
          ),
        },
      };
    }
    return {
      ...state,
      [action.playerKey]: {
        ...state[action.playerKey],
        [action.field]: action.val,
      },
    };
  };

  const [playerList, dispatchPlayerList] = useReducer(playerListReducer, {
    0: {
      attackBonus: 7,
      spellSaveDC: 14,
      key: 0,
      elvenAccuracy: false,
      battleMaster: false,
      damagers: [new Damager(0)],
      critThreshold: 20,
    },
  } as { [key: number]: Player });

  const [initialPlayerList, setInitialPlayerList] = useState<PlayerList>({});

  const damageData = useHandleDamageData(playerList);

  // const playerContext = React.createContext(playerList[0]);

  const [selectedPlayerKey, setSelectedPlayerKey] = useState(0);

  // const [selectedPlayer, setSelectedPlayer] = useState(playerList[0]);

  // useEffect(() => {
  //   // setSelectedPlayer(playerList[selectedPlayerKey]);
  // }, [selectedPlayerKey]);

  const [graphedPlayer, setGraphedPlayer] = useState<Player>(playerList[0]);

  const [uri, setUri] = useState("");

  const [target, setTarget] = useState<Target>({ ac: 14 });

  const debouncedUpdateURI = useDebouncedCallback(() => {
    // console.log({ ...playerList });
    // console.log(playerList);
    // console.log("QQQQQQQQQQQ");
    //
    // console.log(
    //   JSON.stringify(
    //     transformPlayerList(transformPlayerList(playerList, false), true),
    //     replacer
    //   ) === JSON.stringify(playerList, replacer)
    // );
    // console.log((transformPlayerList(playerList, false), replacer));
    //
    // console.log(
    //   transformPlayerList(transformPlayerList(playerList, false), true)
    // );
    // console.log(
    //   JSON.stringify(
    //     transformPlayerList(transformPlayerList(playerList, false), true),
    //     replacer
    //   )
    // );
    setUri(
      `${location.href.replace(location.search, "")}?d=${Buffer.from(
        JSON.stringify(transformPlayerList(playerList, false), replacer)
      ).toString("base64")}`
    );

    // router.replace({
    //   query: {
    //     d: Buffer.from(
    //       JSON.stringify(transformPlayerList(playerList, false), replacer)
    //     ).toString("base64"),
    //   },
    // });
  }, 1000);

  useEffect(() => {
    debouncedUpdateURI();
  }, [playerList]);

  useEffect(() => {
    const data = decodeURIComponent(
      new URLSearchParams(document.location.search).get("d") || ""
    );
    if (data) {
      let d = Buffer.from(data, "base64").toString();
      let newPlayerList = transformPlayerList(
        JSON.parse(d, reviver),
        true
      ) as PlayerList;
      dispatchPlayerList({
        field: "OVERWRITE",
        val: newPlayerList,
      });
      setInitialPlayerList(newPlayerList);
    } else {
      setInitialPlayerList(playerList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modalContent, setModalContent] = useState<
    React.FC | React.ReactElement
  >(<></>);
  const [modalOpen, setModalOpen] = useState(false);
  const setModalContentWrapper = (modalContent: React.FC) => {
    console.log("setting modal");
    console.log(modalContent);
    setModalContent(modalContent);
    setModalOpen(true);
  };

  const [showCopyPopup, setShowCopyPopup] = useState(false);

  const submitURL = async () => {
    // let dataUrl = (
    //   await HTMLToImage.toSvg(document.getElementById("damageChart")!)
    // ).substring("data:image/svg+xml;charset=utf-8,".length);

    let graphSVG =
      document.getElementById("damageChart")?.children[1].children[0];
    const serializer = new XMLSerializer();
    let dataUrl = new XMLSerializer().serializeToString(graphSVG);
    console.log(graphSVG);

    let labelX = 20;
    let y = 10;
    let tLength = 0;
    let t = [
      ...document.getElementById("damageChartLegend").children[0].children,
    ].map((x) => {
      let [color, name] = x.children;
      let nameText = name.innerText;
      console.log();
      console.log(nameText);
      console.log(color.children[0]);
      tLength = Math.max(tLength, nameText.length);
      let colorFill = color.children[0].getAttribute("fill");
      let ydex = (y += 15);
      return `<rect x="5" y="${ydex}" fill="${colorFill}" width="10" height="10"></rect> <text  x="${labelX}" y="${
        ydex + 4
      }" >${nameText}</text>`;
    });
    console.log(t);
    let legend = `<svg xmlns="http://www.w3.org/2000/svg" width="${
      (tLength * 25) ** 0.85
    }" height="${graphSVG.getAttribute(
      "height"
    )}"> <style><![CDATA[text{ dominant-baseline: middle; font: 12px Verdana, Helvetica, Arial, sans-serif;  }]]></style>
    ${t.join("\n")}
    </svg>`;
    // return;
    console.log(dataUrl);
    console.log(legend);
    let imageStack = (
      await HTMLToImage.toPng(document.getElementById("damageChartLegend")!)
    ).substring("data:image/svg+xml;charset=utf-8,".length);
    //
    // console.log(decodeURIComponent(imageStack));

    // console.log("submitting :)");
    await fetch("https://s.cephalon.xyz", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json",
      },
      body: gzip(
        JSON.stringify({
          image: dataUrl,
          legend: legend,
          url: uri,
        })
      ),
    });
  };

  return (
    <DamageDataContext.Provider value={damageData}>
      <InitialPlayerListContext.Provider value={initialPlayerList}>
        <DispatchPlayerList.Provider value={dispatchPlayerList}>
          <SelectedPlayerContext.Provider value={selectedPlayerKey}>
            <Modal opened={modalOpen} onClose={() => setModalOpen(false)}>
              {modalContent}
            </Modal>
            <AppShell
              fixed
              padding="md"
              navbar={<TargetNavbar target={target} setTarget={setTarget} />}
              aside={
                <SetModalContext.Provider value={setModalContentWrapper}>
                  <MemoDamageGraphs
                    player={playerList[selectedPlayerKey]}
                    target={target}
                    hidden={hideGraphs}
                  />
                </SetModalContext.Provider>
              }
              zIndex={1}
              style={{ isolation: "isolate" }}
              header={
                <Header height={60} p="xs">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Title> Damage Calcs :)</Title>
                    <Burger
                      opened={!hideGraphs}
                      onClick={() => setHideGraphs((o) => !o)}
                      size="sm"
                      ml={"auto"}
                      mr={"sm"}
                    />
                  </div>
                </Header>
              }
              footer={
                <Footer height={30}>
                  <Container
                    mx={0}
                    px={10}
                    py={2}
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Group style={{ width: "100%", height: 25 }}>
                      Share:
                      <div style={{ width: "70%", height: "100%" }}>
                        <TextInput
                          variant={"filled"}
                          value={uri}
                          readOnly
                          icon={<Link />}
                          __staticSelector={"damagerFooterLinkInput"}
                        ></TextInput>
                      </div>
                      <Popover
                        opened={showCopyPopup}
                        position={"top"}
                        withArrow
                        target={
                          <ActionIcon variant={"filled"} color={"blue"}>
                            <Clipboard
                              onClick={() => {
                                navigator.clipboard.writeText(uri);
                                setShowCopyPopup(true);
                                setTimeout(() => setShowCopyPopup(false), 850);
                              }}
                            ></Clipboard>
                          </ActionIcon>
                        }
                      >
                        <Text size={"sm"}>Copied!</Text>
                      </Popover>
                      <Button compact onClick={() => submitURL()}>
                        Shorten
                      </Button>
                      <div style={{ width: "auto", height: "100%" }} />
                      <Badge
                        mr={"sm"}
                        style={{ marginLeft: "auto", cursor: "pointer" }}
                        component={"a"}
                        href={"https://discord.com/invite/dndnext"}
                        variant={"outline"}
                      >
                        Made with &lt;3
                      </Badge>
                    </Group>
                  </Container>

                  {/*</UnstyledButton>*/}
                </Footer>
              }
            >
              <Container pl={0} ml={0} style={{ width: "40%" }}>
                {/*<Paper>*/}
                <Title order={3}>Attacks</Title>
                <Space h={3} />

                {Object.entries(initialPlayerList).length &&
                  Object.entries(playerList).map(([index, player]) => (
                    <PlayerContext.Provider value={player} key={index}>
                      <MemoPlayerCard key={index} target={target} />
                    </PlayerContext.Provider>
                  ))}
              </Container>
            </AppShell>
          </SelectedPlayerContext.Provider>
        </DispatchPlayerList.Provider>
      </InitialPlayerListContext.Provider>
    </DamageDataContext.Provider>
  );
};

export default Damage;
