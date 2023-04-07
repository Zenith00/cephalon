import type { NodeProps, Node } from "react-flow-renderer";
import type {
  DamagerMetadatum,
  NodeMetadatum,
  NodeKeyType,
  NodeType,
  PlayerKey,
  PlayerMetadatum,
  PlayerNode,
  DamagerNode,
  DamagerKey,
  TargetKey,
  TargetNode,
} from "@damageBlocks/types";

export const getPlayerNode = (
  nodes: NodeType[],
  nodeId: PlayerKey
): PlayerNode | undefined =>
  nodes.find((node) => node.id === nodeId) as PlayerNode;

export const getDamagerNode = (
  nodes: NodeType[],
  nodeId: DamagerKey
): DamagerNode | undefined =>
  nodes.find((node) => node.id === nodeId) as DamagerNode;

export const getTargetNode = (
  nodes: NodeType[],
  nodeId: TargetKey
): TargetNode | undefined =>
  nodes.find((node) => node.id === nodeId) as TargetNode;
