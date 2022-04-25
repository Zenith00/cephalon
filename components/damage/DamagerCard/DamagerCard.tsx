import React, { useEffect, useState } from "react";
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Box,
  Paper,
  NumberInput,
  MultiSelect,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { Damager, Player } from "./PlayerCard";
import { Trash, Copy, NewSection } from "tabler-icons-react";
import { useDebouncedCallback } from "use-debounce";

const DamagerCard = ({
  // key,
  damager,
  setDamager,
  copy,
  del,
}: {
  // key: keyof Player["damagers"];
  damager: Damager;
  setDamager: (damager: Damager) => void;
  copy: (damager: Damager) => void;
  del: (damager: Damager) => void;
}) => {
  const [value, toggle] = useToggle("Attack", ["Attack", "Save"]);
  const [data, setData] = useState(["Bless [+1d4]", "Bane [-1d4]"]);

  const [damagerName, setDamagerName] = useState("");
  const [damagerDamage, setDamagerDamage] = useState("");

  const debouncedSetDamager = useDebouncedCallback((damager) => {
    setDamager(damager);
  }, 500);

  useEffect(() => {
    debouncedSetDamager({
      ...damager,
      name: damagerName,
      damage: damagerDamage,
    });
  }, [debouncedSetDamager, damagerName, damagerDamage]);

  return (
    <Paper shadow={"xs"} p={"md"} mt={"md"} sx={{ maxWidth: 320 }} withBorder>
      <Box mx="auto">
        {/*<form onSubmit={form.onSubmit((values) => console.log(values))}>*/}
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <TextInput
            label={`Name: ${damager.key}`}
            placeholder="Eldritch Blast"
            value={damagerName}
            onChange={(ev) => setDamagerName(ev.currentTarget.value)}
          />

          <Button color={value} onClick={() => toggle()} ml={"md"} mt={27}>
            {value}
          </Button>
        </div>

        <TextInput
          mt={"sm"}
          label={"Damage"}
          value={damagerDamage}
          onChange={(ev) => setDamagerDamage(ev.currentTarget.value)}
        ></TextInput>
        <MultiSelect
          data={data}
          creatable
          label={"Attack Modifiers"}
          searchable
          getCreateLabel={(query) => `+ Add ${query}`}
          onCreate={(query) => setData((current) => [...current, query])}
        />
        <Switch label={"Disabled"} pt={"md"} />

        {/*<Group position='right' mt='md'>*/}
        {/*  <Button type='submit'>Submit</Button>*/}
        {/*</Group>*/}
        {/*</form>*/}
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Button
            mt={"md"}
            mr={"md"}
            leftIcon={<Copy />}
            onClick={() => copy(damager)}
          >
            Copy
          </Button>
          <Button
            mt={"md"}
            variant={"outline"}
            color={"red"}
            leftIcon={<Trash />}
            onClick={() => del(damager)}
          >
            Delete
          </Button>
        </div>
      </Box>
    </Paper>
  );
};

export default DamagerCard;
