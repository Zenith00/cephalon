import React from "react";
import {
  Box,
  Checkbox,
  Navbar,
  NumberInput,
  Space,
  Title,
} from "@mantine/core";

import { Target } from "../../pages/Damage";

const Target = ({
  target,
  setTarget,
}: {
  target: Target;
  setTarget: React.Dispatch<React.SetStateAction<Target>>;
}) => {
  return (
    <Navbar width={{ base: 300 }} height={500} p="xs">
      <Box px={"2px"}>
        <Navbar.Section>
          <Title order={4}>Target Info</Title>
          <NumberInput
            label={"AC"}
            step={1}
            value={target.ac}
            onChange={(val) => setTarget({ ...target, ac: val || 0 })}
          />
        </Navbar.Section>
        <Space h={"md"} />
        {/*<Divider pt={"3px"} size={"sm"}/>*/}
        {/*<Navbar.Section>*/}
        {/*  <Title order={4}>Special</Title>*/}
        {/*  <Checkbox label={"Elven Accuracy"} />*/}
        {/*  <Checkbox label={"Lucky"} />*/}
        {/*</Navbar.Section>*/}
      </Box>
    </Navbar>
  );
};

export default Target;
