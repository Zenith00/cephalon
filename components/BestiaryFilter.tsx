import React, { Dispatch, SetStateAction } from 'react'
import { Box, Chip, Chips, Navbar, RangeSlider, Title } from '@mantine/core'
import { CREATURE_TYPES, Filters } from '../pages/ConditionImmunities'

const BestiaryFilter = (
  {
    hidden,
    setFilters,
    filters
  }: { hidden: boolean, setFilters: Dispatch<SetStateAction<Filters>>, filters: Filters }
) => {
  return (
    <Navbar p={'xs'} width={{ sm: 200, md: 300, lg: 400 }} hidden={hidden} hiddenBreakpoint={'sm'}>
      <Navbar.Section mt={'xs'}>
        <Box py={'md'}>
          <Title order={2}>CR</Title>
        </Box>

        <RangeSlider
          max={30}
          min={0}
          minRange={1}
          defaultValue={[0, 30]}
          onChange={(v => setFilters({ ...filters, crInclude: v }))}
          style={{ marginTop: 10, marginBottom: 5 }}

          marks={[
            { value: 0, label: '0' },
            { value: 10, label: '10' },
            { value: 20, label: '20' },

            { value: 30, label: '30' }
          ]}
        />
        <Box py={'md'}>
          <Title order={2}>Creature Types</Title>
        </Box>
        <Chips
          multiple={true}
          defaultValue={CREATURE_TYPES}
          direction={'column'}
          value={filters.creatureTypeInclude}
          onChange={(v => setFilters({ ...filters, creatureTypeInclude: v }))}
        >
          {CREATURE_TYPES.map((c) => <Chip value={c} key={c}>{c}</Chip>)}
        </Chips>

      </Navbar.Section>
    </Navbar>
  )
}

export default BestiaryFilter
