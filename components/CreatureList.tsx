import React from 'react';
import { Aside, ScrollArea, Text } from '@mantine/core';

const CreatureList = ({ creatures }: { creatures: string[] }) => {
  return (
    <Aside p={'md'} width={{ sm: 200, md:250, lg:300}}>
      <Aside.Section component={ScrollArea} grow>
        {creatures.map(c => <Text key={c} style={{fontSize: '1vw', 'whiteSpace': 'nowrap'}}>{c}</Text>)}
      </Aside.Section>

    </Aside>
  );
};

export default CreatureList;
