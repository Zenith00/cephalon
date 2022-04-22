import type { NextPage } from 'next';


import Head from 'next/head';
import Image from 'next/image';
import { ParentSize } from '@visx/responsive';
import ConditionImmunityGraph from '../components/ConditionImmunity.graph';
import { AppShell, Navbar, Header, Text, Footer, Burger, MediaQuery, Title } from '@mantine/core';
import BestiaryFilter from '../components/BestiaryFilter';
import { useCallback, useEffect, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';

const queryString = require('query-string');
import { useDebouncedCallback } from 'use-debounce';
import { StringifiableRecord } from 'query-string';
import CreatureList from '../components/CreatureList';

export const CREATURE_TYPES = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'] as const;
export const SOURCES = ['AI', 'AitFR-ISF', 'AitFR-THP', 'AitFR-DN', 'AitFR-FCD', 'BGDIA', 'CM', 'CoS', 'DC', 'DIP', 'DMG', 'DoD', 'EGW', 'ERLW', 'ESK', 'FTD', 'GGR', 'GoS', 'HftT', 'HoL', 'HotDQ', 'IDRotF', 'IMR', 'KKW', 'LLK', 'LMoP', 'LR', 'MaBJoV', 'MFF', 'MM', 'MPMM', 'MOT', 'MTF', 'NRH-TCMC', 'NRH-AVitW', 'NRH-ASS', 'NRH-CoI', 'NRH-TLT', 'NRH-AWoL', 'NRH-AT', 'OotA', 'OoW', 'PSA', 'PSD', 'PSI', 'PSK', 'PSX', 'PSZ', 'PHB', 'PotA', 'RMBRE', 'RoT', 'RtG', 'SADS', 'SCC', 'SDW', 'SKT', 'SLW', 'TCE', 'TTP', 'TftYP', 'ToA', 'VGM', 'VRGR', 'XGE', 'UA2020SubclassesPt2', 'UA2020SubclassesPt5', 'UA2020SpellsAndMagicTattoos', 'UA2021DraconicOptions', 'UA2021MagesOfStrixhaven', 'UAArtificerRevisited', 'UAClassFeatureVariants', 'UAClericDruidWizard', 'WBtW', 'WDH', 'WDMM'] as const;

export interface Filters extends StringifiableRecord {
  crInclude: [number, number]
  creatureTypeInclude: Partial<typeof CREATURE_TYPES>
  sources: Partial<typeof SOURCES>
}

export interface Datapack {
  column_labels: string[]
  row_labels: string[]
  data: any[]
  typeCounts: { [key in typeof CREATURE_TYPES[number] | 'all']?: number }
  names: string[][][]
}

const ConditionImmunities: NextPage = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({ crInclude: [0, 30], creatureTypeInclude: CREATURE_TYPES, sources: SOURCES });
  const [datapack, setDatapack] = useState<Datapack>({ column_labels: [], row_labels: [], data: [], typeCounts: {}, names: [[]] });
  const [selection, setSelection] = useState<[number?, number?]>([undefined, undefined]);
  const { height, width } = useViewportSize();
  useEffect(() => {
    return () => {
      console.log(selection);
      // console.log(datapack.names);
      console.log(datapack.names?.[selection[0]!]?.[selection[1]!]);
    };
  }, [selection]);

  const debounced = useDebouncedCallback(
    () => {
      fetch(queryString.stringifyUrl({
        url: 'https://arcane.cephalon.xyz/conditions',
        query: filters
      }, { arrayFormat: 'comma' }))
        .then((res) => res.json())
        .then((d) => {
          setDatapack(d);
        });
    },
    500
  );

  useEffect(() => {
    debounced();
  }, [filters]);

  return (
    <div>
      <Head>
        <title>Condition Immunity by Creature Type</title>
      </Head>
      <AppShell
        fixed
        padding='sm'
        navbar={<BestiaryFilter hidden={!filterVisible} setFilters={setFilters} filters={filters}
                                counts={datapack.typeCounts} />}
        aside={<CreatureList creatures={datapack.names?.[selection[0]!]?.[selection[1]!] || []} hidden={!listVisible}/>}
        header={<Header height={60} p='xs'>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan='sm' styles={{ display: 'none' }}>
              <Burger
                opened={filterVisible}
                onClick={() => setFilterVisible((o) => !o)}
                size='sm'
                mr='xl'
              />
            </MediaQuery>
            <Title style={{ fontSize: width > 768 ? '3vh' : '1.5vh' }}>Condition Immunity by Creature Type</Title>
            <Burger
              opened={listVisible}
              onClick={() => setListVisible((o) => !o)}
              size='sm'
              ml={'auto'}
              mr={'sm'}
            />
          </div>

        </Header>

        }
        footer={<Footer height={60} p='md'>🔮</Footer>}
        styles={(theme) => ({
          main: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            height: '100vh'
          }
        })}
      >
        <ParentSize>{({ width, height }) =>
          <ConditionImmunityGraph width={width} height={height} datapack={datapack} setSelection={setSelection} setListVisible={setListVisible}/>
        }</ParentSize>
      </AppShell>
    </div>

  );
};

export default ConditionImmunities;
