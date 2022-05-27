import type { SelectItem } from '@mantine/core';
import { Damager } from '@damage/types';

export const ADVANTAGE_TO_DICE = {
  superadvantage: '3d20kh',
  advantage: '2d20kh',
  normal: '1d20',
  disadvantage: '2d20kl',
  superdisadvantage: '3d20kl',
};
let modifierIndex = 0;

export const defaultModifierOptions = [
  { label: 'Bless [+1d4]', value: (modifierIndex++).toString() },
  { label: 'Bane [-1d4]', value: (modifierIndex++).toString() },
  {
    label: 'S:DS Favored by the Gods [+2d4]',
    value: (modifierIndex++).toString(),
  },
  {
    label: 'C:PC Emboldening Bond [+1d4]',
    value: (modifierIndex++).toString(),
  },
  {
    label: 'D:S Cosmic Omen (Weal) [+1d4]',
    value: (modifierIndex++).toString(),
  },
];

const MODS_2_DATA = (rawModifiers: string[]) => {
  const modifierOptions: SelectItem[] = [];
  const modifiers: string[] = [];
  let index = modifierIndex;
  rawModifiers.forEach((modifier) => {
    modifierOptions.push({
      label: modifier,
      value: (++index).toString(),
    });
    modifiers.push(index.toString());
  });
  return { modifierOptions, modifiers };
};

const make_preset = (name: string, rawModifiers: string[], damage: string, count: number) => (
  (key: number) => {
    const { modifierOptions, modifiers } = MODS_2_DATA(rawModifiers);
    return new Damager(key, damage, count, name, modifierOptions, modifiers);
  });

export const PRESET_DAMAGERS = {
  'Crossbow Expert+Sharpshooter Hand Crossbow': make_preset(
    'CBE/SS + Hand Crossbow',
    ['Sharpshooter [-5]'],
    '1d6+5+10',
    1,
  ),
  'Eldritch Blast + Agonizing Blast': make_preset(
    'EB + Agonizing Blast',
    [],
    '1d10+5',
    1,
  ),
};

export const NARROW_WIDTH = 850;
