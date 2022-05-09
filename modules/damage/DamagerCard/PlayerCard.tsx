import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  NumberInput,
  Paper,
  Popover,
  Select,
  SelectItem,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import DamagerCard from "./DamagerCard";
import { DispatchPlayerList, PlayerContext, Target } from "@pages/Damage";
import { defaultModifierOptions, PRESET_DAMAGERS } from "@damage/constants";

export interface Player {
  key: number;
  attackBonus: number;
  spellSaveDC: number;
  elvenAccuracy?: boolean;
  battleMaster?: boolean;
  damagers: { [key: number]: Damager };
  critThreshold: number;
}

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
  modifierOptions: SelectItem[];
  modifierRaws: string[];
  atkBase: string;
  name: string;
  disabled?: boolean;
  count: number;
  key: keyof Player["damagers"];

  constructor(
    key: number,
    damage?: string,
    count?: number,
    name?: string,
    modifierOptions?: SelectItem[],
    modifiers?: string[]
  ) {
    this.damage = damage ?? "";
    this.advantageShow = new Map([["normal", true]]);
    this.modifiers = [];
    this.atkBase = "0";
    this.name = name ?? "";
    this.disabled = false;
    this.key = key;
    this.count = count || 1;
    this.modifierOptions = (defaultModifierOptions as SelectItem[]).concat(
      ...(modifierOptions || [])
    );

    this.modifierRaws = modifiers ?? [];
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
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  return (
    <Paper
      shadow={"xs"}
      p={"md"}
      mt={"md"}
      sx={{ maxWidth: 600, minWidth: 300 }}
      withBorder
    >
      <Box mx="auto">
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Title order={4}>PC Info</Title>
          <Box mr={"sm"} ml={"auto"} pt={8}>
            <Checkbox label={"Show Damage"} />
          </Box>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <NumberInput
            label={"Attack Bonus"}
            step={1}
            value={player.attackBonus}
            style={{ width: "50%" }}
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
            style={{ width: "50%" }}
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
          mt={10}
          onClick={() => {
            dispatchPlayerList({ field: "NEW_DAMAGER", playerKey: player.key });
          }}
        >
          New Attack
        </Button>
        <Popover
          opened={showPresetPicker}
          onClose={() => setShowPresetPicker(false)}
          target={
            <Button
              mt={10}
              ml={5}
              color={"cyan"}
              onClick={(_: any) => setShowPresetPicker(true)}
            >
              Preset
            </Button>
          }
        >
          <Select
            data={Object.keys(PRESET_DAMAGERS)}
            searchable
            onChange={(x) =>
              x &&
              dispatchPlayerList({
                field: "PRESET_DAMAGER",
                playerKey: player.key,
                newDamagerName: x as keyof typeof PRESET_DAMAGERS,
              })
            }
          />
        </Popover>
      </Box>
    </Paper>
  );
};

export default PlayerCard;
