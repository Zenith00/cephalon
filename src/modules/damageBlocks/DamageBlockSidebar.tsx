import React from 'react';
import {
  Divider, Navbar, Paper, Title,
} from '@mantine/core';
import type { NodeLabelTypes } from '@damageBlocks/constants';

const DamageBlockSidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeLabelTypes) => {
    if (!event.dataTransfer) { return; }
    event.dataTransfer.setData('application/reactflow', nodeType);
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Navbar style={{ width: '20vw' }}>
      <Navbar.Section><Title order={3} pl="sm">Blocks</Title></Navbar.Section>
      <Divider />
      <Paper p="md" onDragStart={(event: React.DragEvent) => onDragStart(event, 'damager')} draggable withBorder style={{ borderColor: 'teal' }}>Damager</Paper>
    </Navbar>
  );
};

export default DamageBlockSidebar;
