import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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

export interface Player {
  id: number;
  attackBonus: number;
  spellSaveDC: number;
  elvenAccuracy?: boolean;
  battleMaster?: boolean;
  damagers: { [key: number]: Damager };
}

export interface Damager {
  damage: string;
  damageMean?: number;
  modifiers: string[];
  name: string;
  disabled?: boolean;
  key: keyof Player["damagers"];
}
const MemoDamagerCard = React.memo(DamagerCard);

const PlayerCard = ({
  player,
  setPlayer,
}: {
  player: Player;
  setPlayer: (p: Player) => void;
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

  const [value, toggle] = useToggle("Attack", ["Attack", "Save"]);
  const [data, setData] = useState(["Bless [+1d4]", "Bane [-1d4]"]);
  const nextDamagerIndex = () =>
    Math.max(...Object.keys(player.damagers).map((i) => parseInt(i))) + 1;

  useEffect(() => {
    console.log(player.damagers);
  }, [player.damagers]);

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
            onChange={(val) => setPlayer({ ...player, attackBonus: val || 0 })}
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
            onChange={(val) => setPlayer({ ...player, spellSaveDC: val || 0 })}
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
            damager={damager}
            setDamager={(d) =>
              setPlayer({
                ...player,
                damagers: { ...player.damagers, [i]: d },
              })
            }
            copy={(d) => {
              setPlayer({
                ...player,
                damagers: {
                  ...player.damagers,
                  [nextDamagerIndex()]: { ...d, key: nextDamagerIndex() },
                },
              });
            }}
            del={(d) => {
              console.log("DELETEING ");
              console.log(d);
              const { [d.key]: _, ...otherDamagers } = player.damagers;
              const newDamagers = {} as typeof player.damagers;
              Object.entries(otherDamagers).map(([k, d], index) => {
                newDamagers[index] = {
                  ...d,
                  key: index,
                } as Damager;
              });
              setPlayer({
                ...player,
                damagers: newDamagers,
              });
            }}
          />
        ))}
        <Button
          onClick={() => {
            setPlayer({
              ...player,
              damagers: {
                ...player.damagers,
                [nextDamagerIndex()]: {
                  damage: "",
                  modifiers: [],
                  name: "",
                  key: nextDamagerIndex(),
                },
              },
            });
          }}
        >
          New Attack
        </Button>
      </Box>
    </Paper>
  );
};

export default PlayerCard;
