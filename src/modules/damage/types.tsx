import type { Flavor } from '@utils/typehelpers';
import type { SelectItem } from '@mantine/core';
import { defaultModifierOptions } from '@damage/constants';

export type AdvantageType =
  | 'superadvantage'
  | 'advantage'
  | 'normal'
  | 'disadvantage'
  | 'superdisadvantage';
export const AdvantageTypes = [
  'superadvantage',
  'advantage',
  'normal',
  'disadvantage',
  'superdisadvantage',
] as AdvantageType[];
// type Key<T> = T
export type DamagerKey = Flavor<number, 'DamagerKey'>;
export type PlayerKey = Flavor<number, 'PlayerKey'>;
export type AC = Flavor<number, 'AC'>
export class Damager {
  damage: string;

  damagerType: 'regular' | 'firstHit' | 'powerAttack';

  advantageShow: Map<AdvantageType, boolean>;

  modifiers: string[];

  modifierOptions: SelectItem[];

  modifierRaws: string[];

  atkBase: string;

  name: string;

  disabled?: boolean;

  count: number;

  key: DamagerKey;

  flags: { 'pam':boolean, 'gwm':boolean, 'powerAttackOptimalOnly' : boolean};

  constructor(
    key: Damager['key'],
    damagerType?: Damager['damagerType'],
    damage?: Damager['damage'],
    count?: Damager['count'],
    name?: Damager['name'],
    modifierOptions?: Damager['modifierOptions'],
    modifiers?: Damager['modifiers'],
    flags?: Damager['flags'],
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
      pam: false, gwm: false, powerAttackOptimalOnly: false,
    };

    this.modifierRaws = modifiers ?? [];
  }
}

export class Player {
  key: PlayerKey;

  attackBonus: number;

  modifier: number;

  spellSaveDC: number;

  elvenAccuracy: boolean;

  battleMaster: boolean;

  damagers: { [key: DamagerKey]: Damager };

  critThreshold: number;

  constructor(
    key: PlayerKey,
    attackBonus?: number,
    modifier?: number,
    spellSaveDC?: number,
    elvenAccuracy?: boolean,
    battleMaster?: boolean,
    damagers?: { [key: DamagerKey]: Damager },
    critThreshold?: number,
  ) {
    this.key = key;
    this.attackBonus = attackBonus ?? 0;
    this.modifier = modifier ?? 0;
    this.spellSaveDC = spellSaveDC ?? 10;
    this.elvenAccuracy = elvenAccuracy ?? false;
    this.battleMaster = battleMaster ?? false;
    this.damagers = damagers ?? {};
    this.critThreshold = critThreshold ?? 20;
  }
}
