import { ParentSize } from '@visx/responsive';
import {
  AppShell, Burger, Footer, Header, MediaQuery, Title,
} from '@mantine/core';
import BestiaryFilterNavbar from '@/condition/BestiaryFilter.navbar';
import React, { useEffect, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { useDebouncedCallback } from 'use-debounce';
import type { StringifiableRecord } from 'query-string';
import queryString from 'query-string';
import CreatureList from '@/condition/CreatureList';
import ConditionImmunityGraph from '@/condition/ConditionImmunity.graph';
import { CREATURE_TYPES, SOURCES } from '@/condition/constants';

export interface Filters extends StringifiableRecord {
  crInclude: [number, number];
  creatureTypeInclude: Partial<typeof CREATURE_TYPES>;
  sources: Partial<typeof SOURCES>;
}

export interface Datapack {
  column_labels: string[];
  row_labels: string[];
  data: { bins: any[] }[];
  typeCounts: { [key in typeof CREATURE_TYPES[number] | 'all']?: number };
  names: string[][][];
}

const ConditionImmunities = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    crInclude: [0, 30],
    creatureTypeInclude: CREATURE_TYPES,
    sources: SOURCES,
  });
  const [datapack, setDatapack] = useState<Datapack>({
    column_labels: [],
    row_labels: [],
    data: [],
    typeCounts: {},
    names: [[]],
  });
  const [selection, setSelection] = useState<[number, number]>();
  const viewPortWidth = useViewportSize().width;
  useEffect(() => () => {
    //
  }, [selection]);

  const debounced = useDebouncedCallback(() => {
    fetch(
      queryString.stringifyUrl(
        {
          url: 'https://arcane.cephalon.xyz/conditions',
          query: filters,
        },
        { arrayFormat: 'comma' },
      ),
    )
      .then((res) => res.json())
      .then((d) => {
        setDatapack(d as Datapack);
      }).catch((e) => console.error(e));
  }, 500);

  useEffect(() => {
    debounced();
  }, [debounced, filters]);

  return (
    <div>

      <AppShell
        fixed
        padding="sm"
        navbar={(
          <BestiaryFilterNavbar
            hidden={!filterVisible}
            setFilters={setFilters}
            filters={filters}
            counts={datapack.typeCounts}
          />
        )}
        aside={(
          <CreatureList
            creatures={
              (selection && datapack.names?.[selection[0]]?.[selection[1]])
              || []
            }
            hidden={!listVisible}
            selected={
              selection && {
                creatureType: datapack.column_labels[selection[1]],
                condition: datapack.row_labels[selection[0]],
              }
            }
          />
        )}
        header={(
          <Header height={60} p="xs">
            <div
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger
                  opened={filterVisible}
                  onClick={() => setFilterVisible((o) => !o)}
                  size="sm"
                  mr="xl"
                />
              </MediaQuery>
              <Title style={{ fontSize: viewPortWidth > 768 ? '3vh' : '1.5vh' }}>
                Condition Immunity by Creature Type
              </Title>
              <Burger
                opened={listVisible}
                onClick={() => setListVisible((o) => !o)}
                size="sm"
                ml="auto"
                mr="sm"
              />
            </div>
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
        <ParentSize>
          {({ width, height }) => (
            <ConditionImmunityGraph
              width={width}
              height={height}
              datapack={datapack}
              setSelection={setSelection}
              setListVisible={setListVisible}
            />
          )}
        </ParentSize>
      </AppShell>
    </div>
  );
};

export default ConditionImmunities;
