import type { NodeProps, Node } from 'react-flow-renderer';
import type {
  DamagerDatum, MetadatumType, NodeIDType, NodeType,
} from '@damageBlocks/types';

export const getNode = <T, >(nodes: NodeType<MetadatumType>[], nodeId: NodeIDType) : NodeType<T> | undefined => nodes.find((node) => node.id === nodeId) as unknown as NodeType<T>;
