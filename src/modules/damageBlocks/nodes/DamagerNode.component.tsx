import React, { useEffect, useState } from 'react';
import {
  Divider,
  NumberInput, Paper, Text, TextInput,
} from '@mantine/core';
import type { NodeProps, Node } from 'react-flow-renderer';
import {
  useEdges, useNodes, Handle, Position,
} from 'react-flow-renderer';
import type { PlayerNodeData } from '@damageBlocks/nodes/PlayerNode.component';
import LabeledHandler from '@damageBlocks/LabeledHandler/handler';
import { EdgeContext, NodeIdContext } from '@damageBlocks/contexts';
import { Damager } from '@damage/types';
import type { PMF } from '@utils/math';
import { weighted_mean_pmf, isSimpleProcessable } from '@utils/math';
import produce from 'immer';

import type { Promise } from 'workerpool';
import workerpool from 'workerpool';
import type {
  AC, BlockPlayer, DamagePMFByAC, DamagerDatum, HitPMF, MetadatumType,
  NodeType, PlayerDatum,
} from '@damageBlocks/types';
import { BlockDamager } from '@damageBlocks/types';
import type { computeDamageInfo } from '@damageBlocks/mathWorker';
import { NodeTypeDatum } from '@damageBlocks/constants';
import { getNode } from '@damageBlocks/utils';

const pool = workerpool.pool('/mathWorker.js');

export interface DamagerNodeData {
  data: MetadatumType & {type: 'damager'}
}
const DamagerNode = ({ data, id } : DamagerNodeData & NodeProps) => {
  const s = 2;
  const [damager, setDamager] = useState(new BlockDamager(id));
  const [damageData, setDamageData] = useState<DamagePMFByAC>();
  const [toHitData, setToHitData] = useState<PMF[]>();
  const [sourcePlayer, setSourcePlayer] = useState<BlockPlayer>();
  const [sourceOnHitPMFs, setSourceOnHitPMFs] = useState<HitPMF[]>([]);
  const workerRef = React.useRef<Promise<Map<AC, PMF>>>();
  const Edges = useEdges();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const Nodes = useNodes() as NodeType<MetadatumType>[];

  React.useEffect(() => {
    console.log({ sourcePlayer });
    if (!sourcePlayer && sourceOnHitPMFs.length === 0) { return; }
    pool.proxy()
      .then((worker) => {
        workerRef.current?.cancel().catch(() => {});
        console.log('Computing');
        console.log(sourceOnHitPMFs);
        const p = worker.computeDamageInfo(damager, 'normal', sourcePlayer, sourceOnHitPMFs);
        workerRef.current = p;
        return p;
      })
      .then((res) => {
        console.log('Got!');
        console.log({ res });
        const { damagePMFByAC, toHitCumulatives } = res as unknown as ReturnType<typeof computeDamageInfo>;
        setDamageData(damagePMFByAC);
        setToHitData(toHitCumulatives);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [damager, sourcePlayer, sourceOnHitPMFs]);

  useEffect(() => {
    setDamager(produce((draft) => { draft.sourcePlayer = sourcePlayer; }));
  }, [sourcePlayer]);

  useEffect(() => {
    const ontoEdges = Edges.filter((edge) => edge.target === id);
    const playerEdge = ontoEdges.find((edge) => edge.source.startsWith('player|'));
    const playerNode = playerEdge && getNode(Nodes, playerEdge.source as `player|${number}`) as NodeType<PlayerDatum>;

    if (playerNode && playerNode.type === 'player') { setSourcePlayer(playerNode.data.player); }

    const damagerOnHitEdges = ontoEdges.filter((edge) => edge.source.startsWith('damager|'));
    const sourceOnHitDamagerNodes = damagerOnHitEdges.map((damagerOnHitEdge) => getNode(Nodes, damagerOnHitEdge.source as `damager|${number}`)) as NodeType<DamagerDatum>[];
    const inheritedSourcePlayer = sourceOnHitDamagerNodes[0]?.data.damager.sourcePlayer;
    if (sourceOnHitDamagerNodes && inheritedSourcePlayer) { setSourceOnHitPMFs(sourceOnHitDamagerNodes.map((x) => x.data.hitPMF)); setSourcePlayer((inheritedSourcePlayer)); }
  }, [Edges, id]);

  useEffect(() => {
    console.log('Damage:');
    console.log({ damageData });
  }, [damageData]);

  const [damage, setDamage] = useState<string>();
  const [damageError, setDamageError] = useState(false);

  return (
    <NodeIdContext.Provider value={id}>

      <div style={{ alignItems: 'center', height: '100%', display: 'flex' }}>
        <Paper shadow="xs" p="xs" mt="sm" style={{ marginLeft: '0px', marginRight: '0px' }} withBorder>

          <Text>Damager</Text>

          <div
            style={{
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <TextInput
              label="Damage"
              value={damage}
              placeholder="1d10+mod"
              error={damageError}
              onChange={(ev) => {
                const newValue = ev.currentTarget?.value;
                setDamage(newValue);
                if (newValue && isSimpleProcessable(newValue)) {
                  setDamageError(false);
                  setDamager(produce((draft) => { draft.damage = newValue; }));
                } else {
                  setDamageError(true);
                }
              }}
            />

          </div>
          <Divider mt="xs" />
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}

          {damageData?.get(1) && <TextInput label="Average Damage" value={weighted_mean_pmf(damageData.get(1)!).toString(3)} size="xs" variant="filled" />}
          {sourceOnHitPMFs.length === 0 && <LabeledHandler type="target" position={Position.Left} id="playerIn" labelType="player" />}
          <LabeledHandler type="source" position={Position.Right} id="damagerOut" labelType="damager" />
          <LabeledHandler type="source" position={Position.Right} id="hitOut" labelType="onHit" />
          <LabeledHandler type="target" position={Position.Left} id="hitIn" labelType="onHit" />
        </Paper>
        <div style={{ width: '20%' }} />

      </div>
    </NodeIdContext.Provider>

  );
};

export default DamagerNode;
