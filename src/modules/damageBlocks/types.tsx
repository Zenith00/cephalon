// import type { AdvantageType, Damager, Player } from "@damage/types";
// import type { NodeLabelTypes } from "@damageBlocks/constants";

// import type { Flavor } from "@utils/typehelpers";
// import type { SelectItem } from "@mantine/core";
// import { defaultModifierOptions } from "@damage/constants";
// import type { PMF } from "@utils/math";
// import type Fraction from "fraction.js";
// import { immerable } from "immer";
// import type { Node, NodeProps } from "react-flow-renderer";

// export type HitPMF = Flavor<PMF, "HitPMF">;
// export type DamagePMF = Flavor<PMF, "DamagePMF">;
// // type Key<T> = T
// export type DamagerKey = Flavor<string, "DamagerKey">;
// export type PlayerKey = Flavor<`player|${number}`, "PlayerKey">;
// export type TargetKey = Flavor<`target|${number}`, "TargetKey">;
// export type NodeKeyType = DamagerKey | PlayerKey | TargetKey;

// export type AC = Flavor<number, "AC">;
// export class BlockDamager {
//   [immerable] = true;

//   damage: string;

//   damagerType: "regular" | "onHit" | "powerAttack";

//   advantageShow: Map<AdvantageType, boolean>;

//   modifiers: string[];

//   modifierOptions: SelectItem[];

//   modifierRaws: string[];

//   atkBase: string;

//   name: string;

//   disabled?: boolean;

//   count: number;

//   key: DamagerKey;

//   // eslint-disable-next-line no-use-before-define
//   sourcePlayer?: PlayerKey;

//   flags: {
//     pam: boolean;
//     gwm: boolean;
//     powerAttackOptimalOnly: boolean;
//     triggersOnHit: boolean;
//     advanced: {
//       advantageMode: AdvantageType;
//     };
//   };

//   constructor(
//     key: BlockDamager["key"],
//     damagerType?: BlockDamager["damagerType"],
//     damage?: BlockDamager["damage"],
//     count?: BlockDamager["count"],
//     name?: BlockDamager["name"],
//     modifierOptions?: BlockDamager["modifierOptions"],
//     modifiers?: BlockDamager["modifiers"],
//     flags?: BlockDamager["flags"],
//     sourcePlayer?: BlockDamager["sourcePlayer"]
//   ) {
//     this.damage = damage ?? "";
//     this.damagerType = damagerType || "regular";
//     this.advantageShow = new Map([["normal", true]]);
//     this.modifiers = [];
//     this.atkBase = "0";
//     this.name = name ?? "";
//     this.disabled = false;
//     this.key = key;
//     this.count = count || 1;
//     this.modifierOptions = (defaultModifierOptions as SelectItem[]).concat(
//       ...(modifierOptions || [])
//     );
//     this.flags = flags || {
//       pam: false,
//       gwm: false,
//       powerAttackOptimalOnly: false,
//       triggersOnHit: true,
//       advanced: { advantageMode: "normal" },
//     };

//     this.modifierRaws = modifiers ?? [];
//     this.sourcePlayer = sourcePlayer;
//   }
// }

// export class BlockPlayer {
//   [immerable] = true;

//   key: PlayerKey;

//   name: string;

//   attackBonus: number;

//   modifier: number;

//   spellSaveDC: number;

//   elvenAccuracy: boolean;

//   battleMaster: boolean;

//   damagers: { [key: DamagerKey]: BlockDamager };

//   critThreshold: number;

//   constructor(
//     key: PlayerKey,
//     name?: BlockPlayer["name"],
//     attackBonus?: BlockPlayer["attackBonus"],
//     modifier?: BlockPlayer["modifier"],
//     spellSaveDC?: BlockPlayer["spellSaveDC"],
//     elvenAccuracy?: BlockPlayer["elvenAccuracy"],
//     battleMaster?: BlockPlayer["battleMaster"],
//     damagers?: BlockPlayer["damagers"],
//     critThreshold?: BlockPlayer["critThreshold"]
//   ) {
//     this.key = key;
//     this.name = name ?? "";
//     this.attackBonus = attackBonus ?? 0;
//     this.modifier = modifier ?? 0;
//     this.spellSaveDC = spellSaveDC ?? 10;
//     this.elvenAccuracy = elvenAccuracy ?? false;
//     this.battleMaster = battleMaster ?? false;
//     this.damagers = damagers ?? {};
//     this.critThreshold = critThreshold ?? 20;
//   }
// }
// // export type DamagerTypes = Damager['damagerType']
// export type DamageInfo = {
//   pmf: DamagePMF;
//   mean: Fraction;
//   bestType: BlockDamager["damagerType"];
//   metadata?: { pamBreakPoint?: boolean };
// };

// // export type MetadatumType = BlockDamager | BlockPlayer

// export type DamagerMetadatum = {
//   damager: BlockDamager;
//   hitPMF: HitPMF;
// };
// export type PlayerMetadatum = {
//   player: BlockPlayer;
// };
// export type TargetMetadatum = {
//   target: BlockPlayer;
// };

// export type NodeMetadatum = DamagerMetadatum | PlayerMetadatum;

// // export type Metadata = Record<NodeIDType, DamagerMetadatum & PlayerMetadatum>

// export type DamagePMFByAC = Map<AC, DamagePMF>;

// // export interface NodeType<T extends NodeMetadatum> extends Node<T> {
// //   id: NodeKeyType;
// // }

// export interface PlayerNode extends Node {
//   id: PlayerKey;
//   data: PlayerMetadatum;
// }

// export interface DamagerNode extends Node {
//   id: DamagerKey;
//   data: DamagerMetadatum;
// }

// export interface TargetNode extends Node {
//   id: TargetKey;
//   data: TargetMetadatum;
// }

// export type NodeType = PlayerNode | DamagerNode | TargetNode;

// // export type NodeType= T extends DamagerMetadatum
// //   ? {id: DamagerKey;}
// //   : T extends PlayerMetadatum ? {id: PlayerKey} : never
// // : T extends false ? 'object' : 'object'

// // export type NodeType<T> = Node<PlayerMetadatum> | Node<DamagerMetadatum>

// export interface _EnrichedNodeProps extends NodeProps {
//   id: NodeKeyType | string;
// }

// export type EnrichedNodeProps = Omit<_EnrichedNodeProps, "data">;
