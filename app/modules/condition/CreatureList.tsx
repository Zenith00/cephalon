import React from 'react';
import {
  Aside, ScrollArea, Text, Title,
} from '@mantine/core';

const CreatureList = ({
  creatures,
  hidden,
  selected,
}: {
  creatures: string[];
  hidden: boolean;
  selected?: { condition: string; creatureType: string };
}) => (
  <Aside
    p="md"
    width={{
      sm: 250, md: 250, lg: 275, xl: 425,
    }}
    hiddenBreakpoint="sm"
    hidden={hidden}
  >
    {selected && (
    <Title
      order={3}
    >
      {`${selected.creatureType[0].toLocaleUpperCase()}${selected.creatureType.substring(
        1,
      )}s immune to ${selected.condition.toLocaleLowerCase()}:`}
    </Title>
    )}
    <Aside.Section component={ScrollArea} grow>
      {creatures.map((c) => (
        <Text
          key={c}
          style={{ fontSize: hidden ? '1vw' : '20px', whiteSpace: 'nowrap' }}
        >
          {c}
        </Text>
      ))}
    </Aside.Section>
  </Aside>
);

export default CreatureList;
