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

export class Damager {
  damage: string;

  damageMean?: number;

  advantageShow: Map<AdvantageType, boolean>;

  modifiers: string[];

  modifierOptions: SelectItem[];

  modifierRaws: string[];

  atkBase: string;

  name: string;

  disabled?: boolean;

  count: number;

  key: DamagerKey;

  special: { 'pam': boolean, 'gwm': boolean };

  constructor(
    key: DamagerKey,
    damage?: string,
    count?: number,
    name?: string,
    modifierOptions?: SelectItem[],
    modifiers?: string[],
    special?: { 'pam': boolean, 'gwm': boolean },
  ) {
    this.damage = damage ?? '';
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
    this.special = special || { pam: false, gwm: false };

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
