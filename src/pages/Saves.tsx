import React, { useEffect, useState } from 'react';
import {
  AppShell, ColorSchemeProvider, Footer, Grid, Header, MantineProvider, SegmentedControl,
} from '@mantine/core';
import { ParentSize } from '@visx/responsive';
import type { CREATURE_TYPES } from '@condition/constants';
import { SOURCES } from '@condition/constants';
import type { scaleBand } from '@visx/scale';
import { scaleLinear } from '@visx/scale';
import { getRandomNormal, getSeededRandom } from '@visx/mock-data';
import type { Stats } from '@visx/mock-data/lib/generators/genStats';
import genStats from '@visx/mock-data/lib/generators/genStats';
import { useThrottledCallback } from 'use-debounce';
import type { StringifiableRecord } from 'query-string';
import queryString from 'query-string';
import SaveGraphs from '@saves/saveGraphs';
import type { Flavor } from '@utils/typehelpers';
import SavesFilterNavbar from '@saves/filterNavbar.component';
import produce from 'immer';

export type SaveTypes = 'STR' | 'DEX' | 'CON' | 'WIS' | 'INT' | 'CHA'
export interface SaveData {
  binData: Record<Flavor<string, 'bin'>, {value: number, count: number}[]>
  boxplot: Record<Flavor<string, 'bin'>, {x: SaveTypes, min: number, max: number, median: number, firstQuartile: number, thirdQuartile: number}>
}

export type SaveDatapack = {
  saveData: Record<SaveTypes, SaveData>
  typeCounts: { [key in typeof CREATURE_TYPES[number] | 'all']?: number };
  saveRange: [number, number]
}

export interface SaveFilters extends StringifiableRecord {
  sources: Partial<typeof SOURCES>;
  creatureType: typeof CREATURE_TYPES[number],
  binSize: number,
  binLeft: boolean,
  crMin: number,
  crMax: number,
}
export interface SaveGraphOptions {
  showViolin: boolean;
  globalYAxis: boolean;
}
const Saves = () => {
  const [datapack, setDatapack] = useState<SaveDatapack>();
  // const [yScale, setYScale] = useState();
  const [filters, setFilters] = useState<SaveFilters>({
    creatureType: 'dragon',
    sources: SOURCES,
    binSize: 4,
    binLeft: true,
    crMin: 0,
    crMax: 30,
  });
  const seededRandom = getSeededRandom(0.1);
  const randomNormal = getRandomNormal.source(getSeededRandom(0.789))(4, 3);
  const data: Stats[] = genStats(5, randomNormal, () => 10 * seededRandom());
  const [saveGraphOptions, setSaveGraphOptions] = useState<SaveGraphOptions>({ showViolin: false, globalYAxis: false });

  const [hideNavBar, setHideNavBar] = useState(false);

  const yScale = scaleLinear<number>({
    range: [-10, 10],
    round: true,
    domain: [0, 1],
  });
  console.log('exdata');
  console.log(data);

  const [xScale, setXScale] = useState<ReturnType<typeof scaleBand<string>>>();
  const [selectedSave, setSelectedSave] = useState<SaveTypes>('STR');
  const throttled = useThrottledCallback(() => {
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
    console.log('filters changed ');
    throttled();
  }, [filters]);

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles>
      <AppShell
        fixed
        padding="sm"
        navbar={
        datapack?.typeCounts
          && (
          <SavesFilterNavbar
            hidden={hideNavBar}
            setFilters={setFilters}
            filters={filters}
            saveGraphOptions={saveGraphOptions}
            setSaveGraphOptions={setSaveGraphOptions}
            counts={datapack?.typeCounts}
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
                  Saving Throws
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
            🔮
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
          <SaveGraphs width={width} height={height} datapack={datapack} filters={filters} selectedSave={selectedSave} saveGraphOptions={saveGraphOptions} />
        )}
      </ParentSize>
      )}
      </AppShell>
    </MantineProvider>
  );
};

export default Saves;
