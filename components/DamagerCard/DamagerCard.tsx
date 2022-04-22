import React, { useState } from "react";
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

const DamagerCard = () => {
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
    <Paper shadow={"xs"} p={"md"} mt={"md"} sx={{ maxWidth: 320 }} withBorder>
      <Box mx="auto">
        {/*<form onSubmit={form.onSubmit((values) => console.log(values))}>*/}
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <TextInput label="Name" placeholder="Eldritch Blast" />

          <Button color={value} onClick={() => toggle()} ml={"md"} mt={27}>
            {value}
          </Button>
        </div>

        <TextInput mt={"sm"} label={"Damage"}></TextInput>
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
      </Box>
    </Paper>
  );
};

export default DamagerCard;
