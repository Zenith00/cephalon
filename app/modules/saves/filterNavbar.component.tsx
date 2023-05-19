import React, { useRef } from 'react';
import type { SaveFilters, SaveGraphOptions } from '@pages/Saves';
import {
  Input,
   Navbar, NumberInput, SegmentedControl, Select, Switch,
} from '@mantine/core';
import { CREATURE_TYPES, CREATURE_TYPES_WITH_ALL } from '@/condition/constants';
import produce from 'immer';
import type { SetState } from '@utils/typehelpers';
import type { Updater} from "use-immer";
import { useImmer } from "use-immer";

const SavesFilterNavbar = ({
  hidden,
  filters,
  setFilters,
  saveGraphOptions,
  setSaveGraphOptions,
}:{
  hidden: boolean;
  setFilters: Updater<SaveFilters>;
  filters: SaveFilters;
  saveGraphOptions: SaveGraphOptions,
  setSaveGraphOptions: Updater<SaveGraphOptions>,
}) => {
  const binSizeRef = useRef<HTMLInputElement>(null);
  return (
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
          data={(CREATURE_TYPES_WITH_ALL).map((creatureType) => ({
            value: creatureType,
            label: creatureType[0].toUpperCase() + creatureType.slice(1),
          }))}
          value={filters.creatureType}
          onChange={(v: typeof CREATURE_TYPES_WITH_ALL[number]) => setFilters(((draft) => {
            draft.creatureType = v;
          }))}
          onWheel={(ev: React.WheelEvent) => setFilters(((draft) => { draft.creatureType = CREATURE_TYPES_WITH_ALL[(CREATURE_TYPES_WITH_ALL.indexOf(filters.creatureType) + (ev.deltaY > 0 ? 1 : -1))]; }))}
        />
        <NumberInput
          defaultValue={4}
          label="CR Bucket Size"
          value={filters.binSize}
          onChange={(val?: number | "") => setFilters(((draft) => { draft.binSize = val || 1; }))}
          min={1}
          max={15}
          step={1}
          stepHoldDelay={500}
          stepHoldInterval={100}
          ref={binSizeRef}
          onWheel={(ev: React.WheelEvent) => {
            binSizeRef.current?.blur();
            return setFilters(((draft) => {
              draft.binSize = Math.max(1, Math.min(15, (filters.binSize + (ev.deltaY < 0 ? 1 : -1))));
            }));
          }}
        />
        <Input.Wrapper label="Align Bucket" pt="xs">
          <SegmentedControl
            data={[{ label: 'Left', value: 'Left' }, { label: 'Right', value: 'Right' }]}
            value={filters.binLeft ? 'Left' : 'Right'}
            onChange={(val: string) => setFilters(((draft) => { draft.binLeft = val === 'Left'; }))}
          />
        </Input.Wrapper>

      </Navbar.Section>

      <Navbar.Section py="sm">
        <Switch
          label="Show Violin Plots"
          checked={saveGraphOptions.showViolin}
          onChange={(ev) => setSaveGraphOptions(((draft) => { draft.showViolin = ev.currentTarget.checked; }))}
        />
        <Switch
          label="Use global Y axis"
          checked={saveGraphOptions.globalYAxis}
          onChange={(ev) => setSaveGraphOptions(((draft) => { draft.globalYAxis = ev.currentTarget.checked; }))}
        />
      </Navbar.Section>

    </Navbar>
  );
};

export default SavesFilterNavbar;