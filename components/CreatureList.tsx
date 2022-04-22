import React from 'react';
import { Aside, ScrollArea, Text } from '@mantine/core';

const CreatureList = ({ creatures , hidden}: { creatures: string[], hidden:boolean }) => {
  return (
    <Aside p={'md'} width={{ sm: 200, md:250, lg:300}} hiddenBreakpoint={'sm'} hidden={hidden}>
      <Aside.Section component={ScrollArea} grow>
        {creatures.map(c => <Text key={c} style={{fontSize: hidden ? '1vw' : '20px', 'whiteSpace': 'nowrap'}}>{c}</Text>)}
      </Aside.Section>

    </Aside>
  );
};

export default CreatureList;
