import React, { useEffect, useReducer, useState } from "react";
import {
  AppShell,
  Burger,
  Container,
  Header,
  Space,
  Title,
} from "@mantine/core";
import DamageGraphs from "@damage/DamageGraphs";
import { useRouter } from "next/router";

import PlayerCard, {
  AdvantageType,
  Damager,
  Player,
} from "@/damage/DamagerCard/PlayerCard";
import TargetNavbar from "@/damage/Target.navbar";
import { dummyDamageData, useHandleDamageData } from "@/damage/damageData.hook";
import { useDebouncedCallback } from "use-debounce";

export interface Target {
  ac: number;
}

const PLAYER_SHORT_TO_FIELD = new Map<String, keyof Player>([
  ["k", "key"],
  ["a", "attackBonus"],
  ["s", "spellSaveDC"],
  ["e", "elvenAccuracy"],
  ["b", "battleMaster"],
  ["d", "damagers"],
  ["c", "critThreshold"],
]);

const PLAYER_FIELD_TO_SHORT = new Map(
  [...PLAYER_SHORT_TO_FIELD.entries()].map(([k, v]) => [v, k])
);

const DAMAGER_SHORT_TO_FIELD = new Map<String, keyof Damager>([
  ["dmg", "damage"],
  ["dm", "damageMean"],
  ["as", "advantageShow"],
  ["m", "modifiers"],
  ["mo", "modifierOptions"],
  ["mr", "modifierRaws"],
  ["a", "atkBase"],
  ["n", "name"],
  ["di", "disabled"],
  ["k", "key"],
]);

const DAMAGER_FIELD_TO_SHORT = new Map(
  [...DAMAGER_SHORT_TO_FIELD.entries()].map(([k, v]) => [v, k])
);

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

const MemoDamageGraphs = React.memo(DamageGraphs);

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
                          DAMAGER_MAP.get(damagerKey as keyof Damager),
                          damagerVal,
                        ]
                      )
                    ),
                  ]
                )
              ),
            ];
          } else {
            console.log([
              PLAYER_MAP.get(playerField as keyof Player),
              playerValue,
            ]);
            return [PLAYER_MAP.get(playerField as keyof Player), playerValue];
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
    console.log("===DISPATCHING PLAYER LIST===");
    console.log({ ...state });
    console.log({ ...action });
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
      const nextDamagerIndex =
        Math.max(
          ...Object.keys(state[action.playerKey].damagers).map((i) =>
            parseInt(i)
          ),
          -1
        ) + 1;
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
    } else if (action.field === "COPY_DAMAGER") {
      const nextDamagerIndex =
        Math.max(
          ...Object.keys(state[action.playerKey].damagers).map((i) =>
            parseInt(i)
          ),
          -1
        ) + 1;
      console.log({ nextDamagerIndex });
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

  useEffect(() => {
    console.log("=======PLAYER LIST UPDATED=========");
    console.log({ ...playerList });
  }, [playerList]);

  const damageData = useHandleDamageData(playerList);

  // const playerContext = React.createContext(playerList[0]);

  const [selectedPlayerKey, setSelectedPlayerKey] = useState(0);

  // const [selectedPlayer, setSelectedPlayer] = useState(playerList[0]);

  // useEffect(() => {
  //   // setSelectedPlayer(playerList[selectedPlayerKey]);
  // }, [selectedPlayerKey]);

  const [graphedPlayer, setGraphedPlayer] = useState<Player>(playerList[0]);

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

    console.log(JSON.stringify(playerList, replacer));

    router.replace({
      query: {
        d: Buffer.from(
          JSON.stringify(transformPlayerList(playerList, false), replacer)
        ).toString("base64"),
      },
    });
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
  }, []);

  return (
    <AppShell
      fixed
      padding="md"
      navbar={<TargetNavbar target={target} setTarget={setTarget} />}
      aside={
        <DamageDataContext.Provider value={damageData}>
          <MemoDamageGraphs
            player={playerList[selectedPlayerKey]}
            target={target}
            hidden={hideGraphs}
          />
        </DamageDataContext.Provider>
      }
      zIndex={1}
      style={{ isolation: "isolate" }}
      header={
        <Header height={60} p="xs">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
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
    >
      <Container pl={"md"} ml={"sm"}>
        {/*<Paper>*/}
        <Title order={3}>Attacks</Title>
        <Space h={3} />
        <InitialPlayerListContext.Provider value={initialPlayerList}>
          <DispatchPlayerList.Provider value={dispatchPlayerList}>
            <DamageDataContext.Provider value={damageData}>
              <SelectedPlayerContext.Provider value={selectedPlayerKey}>
                {Object.entries(initialPlayerList).length &&
                  Object.entries(playerList).map(([index, player]) => (
                    <PlayerContext.Provider value={player} key={index}>
                      <MemoPlayerCard key={index} target={target} />
                    </PlayerContext.Provider>
                  ))}
              </SelectedPlayerContext.Provider>
            </DamageDataContext.Provider>
          </DispatchPlayerList.Provider>
        </InitialPlayerListContext.Provider>
      </Container>
    </AppShell>
  );
};

export default Damage;
