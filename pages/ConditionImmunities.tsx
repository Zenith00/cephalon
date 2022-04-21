import type { NextPage } from 'next'


import Head from 'next/head'
import Image from 'next/image'
import { ParentSize } from '@visx/responsive'
import ConditionImmunityGraph from '../components/ConditionImmunity.graph'
import { AppShell, Navbar, Header, Text, Footer, Burger, MediaQuery, Title } from '@mantine/core'
import BestiaryFilter from '../components/BestiaryFilter'
import { useCallback, useEffect, useState } from 'react'


const queryString = require('query-string')
import { useDebouncedCallback } from 'use-debounce'

export const CREATURE_TYPES = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']

export interface Filters {
  crInclude: [number, number]
  creatureTypeInclude: string[]
}

export interface Datapack {
  column_labels: string[]
  row_labels: string[]
  data: any[]
}

const ConditionImmunities: NextPage = () => {
  const [opened, setOpened] = useState(false)
  const [filters, setFilters] = useState<Filters>({ crInclude: [0, 30], creatureTypeInclude: CREATURE_TYPES })
  const [datapack, setDatapack] = useState<Datapack>({ column_labels: [], row_labels: [], data: [] })

  const debounced = useDebouncedCallback(
    () => {
      fetch(queryString.stringifyUrl({
        url: 'https://arcane.cephalon.xyz/conditions',
        query: filters as object
      }, { arrayFormat: 'comma' }))
        .then((res) => res.json())
        .then((d) => {
          setDatapack(d)
        })
    },
    500
  )

  useEffect(() => {
    debounced()
  }, [filters])

  return (
    <AppShell
      fixed
      padding='sm'
      navbar={<BestiaryFilter hidden={!opened} setFilters={setFilters} filters={filters} />}
      header={<Header height={60} p='xs'>
        <MediaQuery largerThan='sm' styles={{ display: 'none' }}>
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size='sm'
            mr='xl'
          />
        </MediaQuery>
        <Title>Condition Immunity by Creature Type</Title></Header>
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
        <ConditionImmunityGraph width={width} height={height} datapack={datapack} />
      }</ParentSize>
    </AppShell>
  )
}

export default ConditionImmunities
