import type { Dispatch, SetStateAction } from 'react';
import React, { useState } from 'react';
import type { Datapack, Filters } from '@pages/ConditionImmunities';
import type { SaveFilters, SaveGraphOptions } from '@pages/Saves';
import {
  InputWrapper,
  Navbar, NumberInput, SegmentedControl, Select, Switch,
} from '@mantine/core';
import { CREATURE_TYPES } from '@condition/constants';
import produce from 'immer';
import type { SetState } from '@utils/typehelpers';

const SavesFilterNavbar = ({
  hidden,
  filters,
  setFilters,
  saveGraphOptions,
  setSaveGraphOptions,
  counts,
}:{
  hidden: boolean;
  setFilters: SetState<SaveFilters>;
  filters: SaveFilters;
  saveGraphOptions: SaveGraphOptions,
  setSaveGraphOptions: SetState<SaveGraphOptions>,
  counts: Datapack['typeCounts']
}) => (
  <Navbar
    p="xs"
    width={{ sm: 200, md: 250, lg: 300 }}
    hidden={hidden}
    hiddenBreakpoint="sm"
  >
    <Navbar.Section>
      <Select
        label="Creature Type"
        placeholder="Pick one"
        data={CREATURE_TYPES.map((creatureType) => ({
          value: creatureType,
          label: creatureType[0].toUpperCase() + creatureType.slice(1),
        }))}
        value={filters.creatureType}
        onChange={(v: typeof CREATURE_TYPES[number]) => setFilters(produce((draft) => {
          draft.creatureType = v;
        }))}
      />
      <NumberInput
        defaultValue={4}
        label="CR Bucket Size"
        value={filters.binSize}
        onChange={(val?: number) => setFilters(produce((draft) => { draft.binSize = val || 1; }))}
        min={0}
        max={15}
        step={1}
      />
      <InputWrapper label="Align Bucket" pt="xs">
        <SegmentedControl
          data={[{ label: 'Left', value: 'Left' }, { label: 'Right', value: 'Right' }]}
          value={filters.binLeft ? 'Left' : 'Right'}
          onChange={(val: string) => setFilters(produce((draft) => { draft.binLeft = val === 'Left'; }))}
        />
      </InputWrapper>

    </Navbar.Section>

    <Navbar.Section py="sm">
      <Switch
        label="Show Violin Plots"
        checked={saveGraphOptions.showViolin}
        onChange={(ev) => setSaveGraphOptions(produce((draft) => { draft.showViolin = ev.currentTarget.checked; }))}
      />
      <Switch
        label="Use global Y axis"
        checked={saveGraphOptions.globalYAxis}
        onChange={(ev) => setSaveGraphOptions(produce((draft) => { draft.globalYAxis = ev.currentTarget.checked; }))}
      />
    </Navbar.Section>

  </Navbar>
);

export default SavesFilterNavbar;
