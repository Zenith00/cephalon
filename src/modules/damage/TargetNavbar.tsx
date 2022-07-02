import React from 'react';
import {
  Box,
  Checkbox,
  Navbar,
  NumberInput,
  Space,
  Switch,
  Title, Tooltip,
} from '@mantine/core';

import type { Target } from '@pages/Damage';
import { InfoCircle } from 'tabler-icons-react';
import type { SetState } from '@utils/typehelpers';

const TargetNavbar = ({
  target,
  setTarget,
  advancedMode,
  setAdvancedMode,
}: {
  target: Target;
  setTarget: SetState<Target>;
  advancedMode: boolean,
  setAdvancedMode: SetState<boolean>
}) => (
  <Navbar width={{ base: 200 }} py="xs" p="xs">
    <Box px="2px">
      <Navbar.Section>
        <Title order={4}>Target Info</Title>
        <NumberInput
          label="AC"
          step={1}
          value={target.ac}
          onChange={(val) => setTarget({ ...target, ac: val || 0 })}
        />
      </Navbar.Section>
      <Space h="md" />

      <Navbar.Section>
        <Title order={4}>Config</Title>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          <Switch label="Advanced Mode" checked={advancedMode} onChange={(ev) => setAdvancedMode(ev.currentTarget.checked)} />
          <Tooltip
            label="Provides a complex damage output"
            pl={4}
            mt={4}
          >
            <InfoCircle size={16} />
          </Tooltip>
        </div>
      </Navbar.Section>

      {/* <Divider pt={"3px"} size={"sm"}/> */}
      {/* <Navbar.Section> */}
      {/*  <Title order={4}>Special</Title> */}
      {/*  <Checkbox label={"Elven Accuracy"} /> */}
      {/*  <Checkbox label={"Lucky"} /> */}
      {/* </Navbar.Section> */}
    </Box>
  </Navbar>
);

export default TargetNavbar;
