import React, { Dispatch, SetStateAction, useState } from "react";
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
  elvenAccuracy: boolean;
  battleMaster: boolean;
}

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

  return (
    <Paper shadow={"xs"} p={"md"} mt={"md"} sx={{ maxWidth: 400 }} withBorder>
      <Box mx="auto">
        <Title order={4}>PC Info</Title>
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
        <DamagerCard />
      </Box>
    </Paper>
  );
};

export default PlayerCard;
