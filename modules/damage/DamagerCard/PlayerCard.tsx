import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Box,
  Paper,
  NumberInput,
  MultiSelect,
  Navbar,
  Title,
  Space,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import DamagerCard from "./DamagerCard";
import {
  DispatchPlayerList,
  PlayerContext,
  playerListReducerAction,
  Target,
} from "../../../pages/Damage";

export interface Player {
  key: number;
  attackBonus: number;
  spellSaveDC: number;
  elvenAccuracy?: boolean;
  battleMaster?: boolean;
  damagers: { [key: number]: Damager };
  critThreshold: number;
}
//
// ["advantage", "2d20kh"],
//   ["normal", "1d20"],
//   ["disadvantage", "2d20kl"],
//   ["elvenaccuracy", "3d20kh"],

export type AdvantageType =
  | "superadvantage"
  | "advantage"
  | "normal"
  | "disadvantage"
  | "superdisadvantage";

export const AdvantageTypes = [
  "superadvantage",
  "advantage",
  "normal",
  "disadvantage",
  "superdisadvantage",
] as AdvantageType[];

export class Damager {
  damage: string;
  damageMean?: number;
  advantageShow: Map<AdvantageType, boolean>;
  modifiers: string[];
  modifierOptionExtras?: { label: string; value: string }[];
  atkBase: string;
  name: string;
  disabled?: boolean;
  key: keyof Player["damagers"];

  constructor(key: number) {
    this.damage = "";
    this.advantageShow = new Map();
    this.modifiers = [];
    this.atkBase = "0";
    this.name = "";
    this.disabled = false;
    this.key = key;
  }
}
const MemoDamagerCard = React.memo(DamagerCard);

const PlayerCard = ({
  // player,
  // setPlayer,
  target,
}: {
  // player: Player;
  // setPlayer: React.Dispatch<playerListReducerAction>;
  target: Target;
}) => {
  const form = useForm({
    initialValues: {
      email: "",
      termsOfService: false,
    },

    validate: {
      email: (value) => true,
    },
  });

  const dispatchPlayerList = useContext(DispatchPlayerList)!;
  const player = useContext(PlayerContext)!;

  const [value, toggle] = useToggle("Attack", ["Attack", "Save"]);
  const [data, setData] = useState(["Bless [+1d4]", "Bane [-1d4]"]);
  const nextDamagerIndex = () =>
    Math.max(...Object.keys(player.damagers).map((i) => parseInt(i))) + 1;

  // useEffect(() => {
  //   setPlayer(player);
  // }, [player]);

  return (
    <Paper shadow={"xs"} p={"md"} mt={"md"} sx={{ maxWidth: 400 }} withBorder>
      <Box mx="auto">
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Title order={4}>PC Info</Title>
          <Box mr={"sm"} ml={"auto"} pt={8}>
            <Checkbox label={"Show Damage"} />
          </Box>
        </div>

        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <NumberInput
            label={"Attack Bonus"}
            step={1}
            value={player.attackBonus}
            onChange={(val) =>
              dispatchPlayerList({
                field: "attackBonus",
                val: val || 0,
                playerKey: player.key,
              })
            }
            formatter={(value) => {
              if (value) {
                let v = value.replace(/^\+/gi, "");
                return parseInt(v) > 0 ? `+${v}` : v;
              }
              return "";
            }}
          />
          <NumberInput
            label={"Spell Save"}
            step={1}
            value={player.spellSaveDC}
            onChange={(val) =>
              dispatchPlayerList({
                field: "spellSaveDC",
                val: val || 0,
                playerKey: player.key,
              })
            }
          />
        </div>
        <Title order={4} py={"sm"}>
          Special
        </Title>
        <Checkbox label={"Elven Accuracy"} />
        <Checkbox label={"Lucky"} />

        <Title order={3} pt={"md"}>
          Attacks
        </Title>
        {Object.entries(player.damagers).map(([i, damager]) => (
          <MemoDamagerCard
            key={parseInt(i)}
            playerKey={player.key}
            damager={damager}
            target={target}
          />
        ))}
        <Button
          onClick={() => {
            dispatchPlayerList({ field: "NEW_DAMAGER", playerKey: player.key });
          }}
        >
          New Attack
        </Button>
      </Box>
    </Paper>
  );
};

export default PlayerCard;
