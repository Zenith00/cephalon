import React, { createContext } from 'react';
import { PlayerList } from '@pages/Damage';
import type { Metadata, MetadatumType, NodeIDType } from '@damageBlocks/types';
import type { Edge, Node } from 'react-flow-renderer';

export const NodeIdContext = createContext<string>('');
// export const {Provider} = NodeIdContext;
// export const {Consumer} = NodeIdContext;

export default NodeIdContext;

export const MetadataContext = React.createContext<Metadata>({});
export const DispatchMetadatumUpdateContext = React.createContext<React.Dispatch<{nodeId: NodeIDType, metadatumUpdate: MetadatumType}>>(() => {});
export const EdgeContext = createContext<Edge[]>([]);
export const NodeContext = createContext<Node[]>([]);
