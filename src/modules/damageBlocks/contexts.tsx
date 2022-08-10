import React, { createContext } from 'react';
import { PlayerList } from '@pages/Damage';
import type {
  NodeKeyType, NodeMetadatum, NodeType,
} from '@damageBlocks/types';
import type { Edge, Node } from 'react-flow-renderer';
import type { SetState } from '@utils/typehelpers';

export const NodeIdContext = createContext<string>('');
// export const {Provider} = NodeIdContext;
// export const {Consumer} = NodeIdContext;

export default NodeIdContext;

// export const MetadataContext = React.createContext<Metadata>({
//
// });

// export const DispatchMetadatumUpdateContext = React.createContext< React.Dispatch<[NodeIDType, MetadatumType[keyof MetadatumType]]>>(() => {});
export const EdgeContext = createContext<Edge[]>([]);
export const NodeContext = createContext<Node[]>([]);
export const SetNodesContext = createContext<SetState<NodeType<NodeMetadatum>[]>>(() => {});
export const UpdateNodeContext = createContext<(_: NodeKeyType, __: NodeMetadatum) => void>(() => {});
