import React from 'react';
import {
  Accordion, Aside, ScrollArea, Text,
} from '@mantine/core';
import type { CreatureName, SpellName } from '@shapechange/types';
import CreatureList from '@condition/CreatureList';

const SpellListAside = ({
  spells,
  hidden,
  jumpTo,
}: {
  spells: Record<SpellName, CreatureName[]>;
  hidden: boolean;
  jumpTo: ({ creature, spell }: {creature: CreatureName, spell: SpellName}) => void
}) => (
  <Aside
    p="md"
    width={{
      sm: 250, md: 250, lg: 275, xl: 425,
    }}
    hiddenBreakpoint="sm"
    hidden={hidden}
  >

    <Aside.Section component={ScrollArea} grow>
      {spells && Object.entries(spells).map(([name, source]) => (
        <Accordion>
          <Accordion.Item label={name}>
            {source.map((sourceCreature) => <Text onClick={() => jumpTo({ creature: sourceCreature, spell: name })}>{sourceCreature}</Text>)}
          </Accordion.Item>
        </Accordion>
      ))}
    </Aside.Section>
  </Aside>
);

export default SpellListAside;
