import type { NodeProps, Node } from 'react-flow-renderer';
import type {
  DamagerMetadatum, NodeMetadatum, NodeKeyType, NodeType,
} from '@damageBlocks/types';

export const getNode = <T extends NodeMetadatum >(nodes: NodeType<NodeMetadatum>[], nodeId: NodeKeyType) : NodeType<T> | undefined => nodes.find((node) => node.id === nodeId) as unknown as NodeType<T>;
