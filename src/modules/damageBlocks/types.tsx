import type { AdvantageType } from '@damage/types';
import type { NodeLabelTypes } from '@damageBlocks/constants';

import type { Flavor } from '@utils/typehelpers';
import type { SelectItem } from '@mantine/core';
import { defaultModifierOptions } from '@damage/constants';
import type { PMF } from '@utils/math';
import type Fraction from 'fraction.js';
import { immerable } from 'immer';
import type { Node } from 'react-flow-renderer';

export type NodeIDType = `${NodeLabelTypes}|${number}`
export type HitPMF = Flavor<PMF, 'HitPMF'>;
export type DamagePMF = Flavor<PMF, 'DamagePMF'>
// type Key<T> = T
export type DamagerKey = Flavor<string, 'DamagerKey'>;
export type PlayerKey = Flavor<`player|${number}`, 'PlayerKey'>;
export type AC = Flavor<number, 'AC'>
export class BlockDamager {
  [immerable] = true;

  damage: string;

  damagerType: 'regular' | 'onHit' | 'powerAttack';

  advantageShow: Map<AdvantageType, boolean>;

  modifiers: string[];

  modifierOptions: SelectItem[];

  modifierRaws: string[];

  atkBase: string;

  name: string;

  disabled?: boolean;

  count: number;

  key: DamagerKey;

  // eslint-disable-next-line no-use-before-define
  sourcePlayer?: BlockPlayer;

  flags: {
    'pam':boolean,
    'gwm':boolean,
    'powerAttackOptimalOnly' : boolean,
    'triggersOnHit': boolean,
    'advanced': {
      advantageMode: AdvantageType
    }
  };

  constructor(
    key: BlockDamager['key'],
    damagerType?: BlockDamager['damagerType'],
    damage?: BlockDamager['damage'],
    count?: BlockDamager['count'],
    name?: BlockDamager['name'],
    modifierOptions?: BlockDamager['modifierOptions'],
    modifiers?: BlockDamager['modifiers'],
    flags?: BlockDamager['flags'],
    sourcePlayer?: BlockDamager['sourcePlayer'],
  ) {
    this.damage = damage ?? '';
    this.damagerType = damagerType || 'regular';
    this.advantageShow = new Map([['normal', true]]);
    this.modifiers = [];
    this.atkBase = '0';
    this.name = name ?? '';
    this.disabled = false;
    this.key = key;
    this.count = count || 1;
    this.modifierOptions = (defaultModifierOptions as SelectItem[]).concat(
      ...(modifierOptions || []),
    );
    this.flags = flags || {
      pam: false, gwm: false, powerAttackOptimalOnly: false, triggersOnHit: true, advanced: { advantageMode: 'normal' },
    };

    this.modifierRaws = modifiers ?? [];
    this.sourcePlayer = sourcePlayer;
  }
}

export class BlockPlayer {
  [immerable] = true;

  key: PlayerKey;

  name: string;

  attackBonus: number;

  modifier: number;

  spellSaveDC: number;

  elvenAccuracy: boolean;

  battleMaster: boolean;

  damagers: { [key: DamagerKey]: BlockDamager };

  critThreshold: number;

  constructor(
    key: PlayerKey,
    name?: BlockPlayer['name'],
    attackBonus?: BlockPlayer['attackBonus'],
    modifier?: BlockPlayer['modifier'],
    spellSaveDC?: BlockPlayer['spellSaveDC'],
    elvenAccuracy?: BlockPlayer['elvenAccuracy'],
    battleMaster?: BlockPlayer['battleMaster'],
    damagers?: BlockPlayer['damagers'],
    critThreshold?: BlockPlayer['critThreshold'],
  ) {
    this.key = key;
    this.name = name ?? '';
    this.attackBonus = attackBonus ?? 0;
    this.modifier = modifier ?? 0;
    this.spellSaveDC = spellSaveDC ?? 10;
    this.elvenAccuracy = elvenAccuracy ?? false;
    this.battleMaster = battleMaster ?? false;
    this.damagers = damagers ?? {};
    this.critThreshold = critThreshold ?? 20;
  }
}
// export type DamagerTypes = Damager['damagerType']
export type DamageInfo = {'pmf':DamagePMF, 'mean':Fraction, 'bestType': BlockDamager['damagerType'], 'metadata'?: {'pamBreakPoint'?: boolean}}

// export type MetadatumType = BlockDamager | BlockPlayer

export type DamagerDatum = {
  damager: BlockDamager
  hitPMF: HitPMF
}
export type PlayerDatum = {
  player: BlockPlayer
}

export type MetadatumType = DamagerDatum | PlayerDatum
export type Metadata = Record<NodeIDType, MetadatumType>

export type DamagePMFByAC = Map<AC, DamagePMF>

export interface NodeType<T> extends Node<T> {
  id: NodeIDType;
}
