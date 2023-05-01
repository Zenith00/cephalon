import React from 'react';
import type { NodeProps } from 'react-flow-renderer';
import { Handle, Position } from 'react-flow-renderer';
import {
  Box,
  Button,
  Collapse,
  NumberInput, Paper,
  Popover,
  Select,
  Switch, Table,
  TextInput,
  Title,
  UnstyledButton,
  Text,
} from '@mantine/core';
import { CaretDown, CaretRight, Plus } from 'tabler-icons-react';
import { PRESET_DAMAGERS } from '@damage/constants';
import { AdvantageTypes } from '@damage/types';
import {
  convolve_pmfs_sum, PMF, weighted_mean_pmf, zero_pmf,
} from '@utils/math';
import LabeledHandler from '@damageBlocks/LabeledHandler/handler';
import { NodeIdContext } from '@damageBlocks/contexts';
import type { BlockPlayer, EnrichedNodeProps } from '@damageBlocks/types';

const handleStyle = { left: 10 };

export interface PlayerNodeData {
  data: BlockPlayer & {type: 'player'}
}
const PlayerNode = ({ data, id } : PlayerNodeData & EnrichedNodeProps) => (
  <NodeIdContext.Provider value={id}>
    <Paper shadow="xs" p="xs" mt="sm" sx={{ width: '100%' }} withBorder>

      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {/* <Title order={4}>PC Info</Title> */}
        <TextInput
          label="Player Name"
          value="name"
          size="xs"
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        // width: "100%",
        }}
      >
        <NumberInput
          label="Attack Bonus"
          step={1}
          value={0}
          size="xs"
          formatter={(value) => {
            if (value) {
              const v = value.replace(/^\+/gi, '');
              return Number(v) > 0 ? `+${v}` : v;
            }
            return '';
          }}
        />

        <NumberInput
          label="Modifier (mod)"
          step={1}
          value={2}
          size="xs"
          formatter={(value) => {
            if (value) {
              const v = value.replace(/^\+/gi, '');
              return Number(v) > 0 ? `+${v}` : v;
            }
            return '';
          }}
        />

      </div>

      <LabeledHandler type="source" position={Position.Right} id="playerOut" labelType="player" />

    </Paper>
  </NodeIdContext.Provider>
  // <div className="text-updater-node">
  //   <Handle type="target" position={Position.Top} />
  //   <div>
  //     <label htmlFor="text">Text:</label>
  //   </div>
  //   <Handle type="source" position={Position.Bottom} id="a" style={handleStyle} />
  //   <Handle type="source" position={Position.Bottom} id="b" />
  // </div>
);

export default PlayerNode;
