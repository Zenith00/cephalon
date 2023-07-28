import React, { useEffect, useState } from 'react';
import {
  AppShell, Burger, Footer, Grid, Group, Header, MantineProvider, SegmentedControl, Title,
} from '@mantine/core';
import { ParentSize } from '@visx/responsive';
import { SOURCES } from '@/condition/constants';
import type { scaleBand } from '@visx/scale';
import { scaleLinear } from '@visx/scale';
import { useDebouncedCallback } from 'use-debounce';
import queryString from 'query-string';
import SaveGraphs from '@/boxplot/saveGraphs';
import type { Flavor } from '@/utils/typehelpers';
import SavesFilterNavbar from '@/boxplot/filterNavbar.component';
import DiscordLink from '@/common/DiscordLink.component';
import { useViewportSize } from '@mantine/hooks';
import type { BoxplotFilter, SingleTypeFilter } from '@/boxplot/types';
import Logo from '@/common/Logo.component';

import inflection from 'inflection';
import { useImmer } from 'use-immer';

export type SaveTypes = 'STR' | 'DEX' | 'CON' | 'WIS' | 'INT' | 'CHA'
export type SaveFilters = {
  creatureType: string, 
  binSize: number
  binLeft: boolean
}
export interface SaveData {
  binData: Record<Flavor<string, 'bin'>, {value: number, count: number}[]>
  boxplot: Record<Flavor<string, 'bin'>, {x: SaveTypes, min: number, max: number, median: number, firstQuartile: number, thirdQuartile: number, count: number}>
}

export type SaveDatapack = {
  saveData: Record<SaveTypes, SaveData>
  typeCount: number;
  saveRange: [number, number]
}

export interface SaveGraphOptions {
  showViolin: boolean;
  globalYAxis: boolean;
}


const Saves = () => {
  const [datapack, setDatapack] = useState<SaveDatapack>();
  // const [yScale, setYScale] = useState();
  const [filters, setFilters] = useImmer<BoxplotFilter>({
    creatureType: 'dragon',
    sources: SOURCES,
    binSize: 4,
    binLeft: true,
    crMin: 0,
    crMax: 30,
  });
  const [saveGraphOptions, setSaveGraphOptions] = useImmer<SaveGraphOptions>({ showViolin: false, globalYAxis: false });

  const [hideNavBar, setHideNavBar] = useState(false);

  const yScale = scaleLinear<number>({
    range: [-10, 10],
    round: true,
    domain: [0, 1],
  });

  const { height: windowHeight, width: windowWidth } = useViewportSize();

  const [xScale, setXScale] = useState<ReturnType<typeof scaleBand<string>>>();
  const [selectedSave, setSelectedSave] = useState<SaveTypes>('STR');
  const throttled = useDebouncedCallback(() => {
    fetch(
      queryString.stringifyUrl(
        {
          url: 'https://arcane.cephalon.xyz/saves',
          query: filters,
        },
        { arrayFormat: 'comma' },
      ),
    )
      .then((res) => res.json())
      .then((d) => {
        setDatapack(d as SaveDatapack);
      }).catch((e) => console.error(e));
  }, 500);

  useEffect(() => {
    throttled();
  }, [filters]);

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles>
      <head>
        <title>Saving Throws by CR</title>
      </head>
      <AppShell
        fixed
        padding="sm"
        navbar={
      (
        <SavesFilterNavbar
          hidden={datapack?.typeCount === undefined || hideNavBar}
          setFilters={setFilters}
          filters={filters}
          saveGraphOptions={saveGraphOptions}
          setSaveGraphOptions={setSaveGraphOptions}
          selectManyCreatures={false}
        />
          )
      }
        header={(
          <Header height={60} p="xs">
            <Grid>
              <Grid.Col span={4}>
                <div
                  style={{ display: 'flex', alignItems: 'center', height: '100%' }}
                >
                  <Burger
                    opened={!hideNavBar}
                    onClick={() => setHideNavBar(!hideNavBar)}
                    size="sm"
                    style={windowWidth > 769 ? { display: 'none' } : {}}
                  />

                  <Logo colorScheme="dark" />
                  <Title order={2}>Saves</Title>
                </div>
              </Grid.Col>
              <Grid.Col span={4}>
                <SegmentedControl
                  style={{ display: 'flex', flex: '1 1 0' }}
                  data={[{ label: 'STR', value: 'STR' }, { label: 'DEX', value: 'DEX' }, { label: 'CON', value: 'CON' }, { label: 'WIS', value: 'WIS' }, { label: 'INT', value: 'INT' }, { label: 'CHA', value: 'CHA' }]}
                  value={selectedSave}
                  onChange={(v: SaveTypes) => setSelectedSave(v)}

                />
              </Grid.Col>
              <Grid.Col span={4}>
                <div style={{ display: 'flex', flex: '1 1 0' }} />
              </Grid.Col>
            </Grid>
          </Header>
    )}
        footer={(
          <Footer height={60} p="md">
            <Group>
              🔮
              <DiscordLink colorScheme="dark" />
            </Group>
          </Footer>
    )}
        styles={(theme) => ({
          main: {
            backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
            height: '100vh',
          },
        })}
      >
        {datapack
      && (
      <ParentSize>
        {({ width, height }) => (
          <SaveGraphs
            width={width}
            height={height}
            saveGraphOptions={saveGraphOptions}
            binData={datapack.saveData[selectedSave].binData}
            boxplot={datapack.saveData[selectedSave].boxplot}
            title={`${selectedSave} Saving Throws of ${filters.creatureType === 'all' ? 'All Creatures' : (filters as SingleTypeFilter).creatureType}s by CR`}
            globalRange={datapack.saveRange}
          />
        )}
      </ParentSize>
      )}
      </AppShell>
    </MantineProvider>
  );
};

export default Saves;
