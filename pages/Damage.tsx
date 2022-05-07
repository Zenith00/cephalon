import React, { useEffect, useMemo, useReducer, useState } from "react";
import { AppShell, Container, Header, Space, Title } from "@mantine/core";
import { formList, useForm } from "@mantine/form";
import DamageGraphs from "@damage/DamageGraphs";
import throttle from "lodash.throttle";
import { useRouter } from "next/router";

import PlayerCard, {
  AdvantageType,
  Damager,
  Player,
} from "@/damage/DamagerCard/PlayerCard";
import TargetNavbar from "@/damage/Target.navbar";
import debounce from "lodash.debounce";
import { dummyDamageData, useHandleDamageData } from "@/damage/damageData.hook";
import { useDebouncedCallback } from "use-debounce";

export interface Target {
  ac: number;
}

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

const MemoDamageGraphs = React.memo(DamageGraphs);

const MemoPlayerCard = React.memo(PlayerCard);

// export interface DamageData {
//
//   [playerKey: number]: {
//     [damagerKey: number]: Map<AdvantageType, Map<number, number>>;
//   };
// }

export type PlayerList = { [key: number]: Player };
export type DamageData = Map<
  number,
  Map<number, Map<AdvantageType, Map<number, number>>>
>;

type playerListReducerActionSupertype = {};

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

const Damage = () => {
  const router = useRouter();

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
          )
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
          )
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

  // const throttledSetGraphedPlayer = useMemo(
  //   () => throttle(setGraphedPlayer, 2000, { trailing: true }),
  //   []
  // );

  const debouncedUpdateURI = useDebouncedCallback(() => {
    console.log({ ...playerList });
    console.log(playerList);
    console.log("<" + JSON.stringify(playerList, replacer).toString() + ">");
    router.replace({
      query: {
        d: Buffer.from(JSON.stringify(playerList, replacer)).toString("base64"),
      },
    });
  }, 1000);

  useEffect(() => {
    // throttledSetGraphedPlayer(playerList[0]);
    debouncedUpdateURI();
  }, [playerList]);

  useEffect(() => {
    const data = decodeURIComponent(
      new URLSearchParams(document.location.search).get("d") || ""
    );
    if (data) {
      let d = Buffer.from(data, "base64").toString();
      console.log(Buffer.from(data, "base64").toString()); /**/
      // console.log(Buffer.from(data, "base64").toString());
      // console.log(JSON.parse(d, reviver));
      // dispatchPlayerList({
      //   field: "OVERWRITE",
      //   val: JSON.parse(d, reviver),
      // });
    }
  }, []);

  return (
    <AppShell
      padding="md"
      navbar={<TargetNavbar target={target} setTarget={setTarget} />}
      aside={
        <DamageDataContext.Provider value={damageData}>
          <MemoDamageGraphs
            player={playerList[selectedPlayerKey]}
            target={target}
          />
        </DamageDataContext.Provider>
      }
      zIndex={1}
      style={{ isolation: "isolate" }}
      header={
        <Header height={60} p="xs">
          <Title> Damage Calcs :)</Title>
        </Header>
      }
    >
      <Container px={"md"}>
        {/*<Paper>*/}
        <Title order={3}>Attacks</Title>
        <Space h={3} />
        <DispatchPlayerList.Provider value={dispatchPlayerList}>
          <SelectedPlayerContext.Provider value={selectedPlayerKey}>
            {Object.entries(playerList).map(([index, player]) => (
              <PlayerContext.Provider value={player} key={index}>
                <MemoPlayerCard key={index} target={target} />
              </PlayerContext.Provider>
            ))}
          </SelectedPlayerContext.Provider>
        </DispatchPlayerList.Provider>
      </Container>
    </AppShell>
  );
};

export default Damage;
