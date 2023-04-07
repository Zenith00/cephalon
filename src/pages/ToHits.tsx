import React, { useEffect, useState } from 'react';
import {
  AppShell, Burger, Footer, Grid, Group, Header, MantineProvider, Title,
} from '@mantine/core';
import { ParentSize } from '@visx/responsive';
import type { CREATURE_TYPES_WITH_ALL } from '@condition/constants';
import { SOURCES } from '@condition/constants';
import { useDebouncedCallback } from 'use-debounce';
import queryString from 'query-string';
import SaveGraphs from '@boxplot/saveGraphs';
import type { Flavor } from '@utils/typehelpers';
import SavesFilterNavbar from '@boxplot/filterNavbar.component';
import DiscordLink from '@common/DiscordLink.component';
import Head from 'next/head';
import { useViewportSize } from '@mantine/hooks';
import pluralize from 'pluralize';
import type { BoxplotFilter, MultiTypeFilter } from '@boxplot/types';
import Logo from '@common/Logo.component';

export interface HitData {
  binData: Record<Flavor<string, 'bin'>, {value: number, count: number}[]>
  boxplot: Record<Flavor<string, 'bin'>, {x: string, min: number, max: number, median: number, firstQuartile: number, thirdQuartile: number, count: number}>
}

export type SaveDatapack = {
  hitData: HitData
  typeCounts: Record<typeof CREATURE_TYPES_WITH_ALL[number], number>;
  saveRange: [number, number]
}

export interface SaveGraphOptions {
  showViolin: boolean;
  globalYAxis: boolean;
}
const Saves = () => {
  const [datapack, setDatapack] = useState<SaveDatapack>();
  // const [yScale, setYScale] = useState();
  const [filters, setFilters] = useState<BoxplotFilter>({
    creatureTypes: ['dragon', 'beast'],
    sources: SOURCES,
    binSize: 4,
    binLeft: true,
    crMin: 0,
    crMax: 30,
  });
  const [saveGraphOptions, setSaveGraphOptions] = useState<SaveGraphOptions>({ showViolin: false, globalYAxis: false });

  const [hideNavBar, setHideNavBar] = useState(false);

  const { height: windowHeight, width: windowWidth } = useViewportSize();

  // const [selectedSave, setSelectedSave] = useState<SaveTypes>('STR');
  const throttled = useDebouncedCallback(() => {
    fetch(
      queryString.stringifyUrl(
        {
          url: 'https://arcane.cephalon.xyz/to_hits',
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
      <Head>
        <title>Average To-Hits by CR</title>
      </Head>
      <AppShell
        fixed
        padding="sm"
        navbar={
      (
        <SavesFilterNavbar
          hidden={datapack?.typeCounts === undefined || hideNavBar}
          setFilters={setFilters}
          filters={filters}
          saveGraphOptions={saveGraphOptions}
          setSaveGraphOptions={setSaveGraphOptions}
          selectManyCreatures
        />
          )
      }
        header={(
          <Header height={60} p="xs">
            <Grid>
              <Grid.Col span={6}>
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
                  {' '}

                </div>
              </Grid.Col>

              <Grid.Col span={6}>
                <div style={{ display: 'flex', flex: '1 1 0' }}><Title order={2}>To Hits</Title></div>
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
            binData={datapack.hitData.binData}
            boxplot={datapack.hitData.boxplot}
            title={`To-Hits of ${(filters as MultiTypeFilter).creatureTypes.includes('all') ? `All ${datapack.typeCounts.all} Creatures` : (filters as MultiTypeFilter).creatureTypes.map((creatureType) => pluralize(creatureType[0].toUpperCase() + creatureType.slice(1), datapack.typeCounts[creatureType], true)).join(', ')} by CR`}
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
