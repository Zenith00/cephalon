import { Damager } from "@damage/DamagerCard/PlayerCard";
import { SelectItem } from "@mantine/core";

export const ADVANTAGE_TO_DICE = {
  superadvantage: "3d20kh",
  advantage: "2d20kh",
  normal: "1d20",
  disadvantage: "2d20kl",
  superdisadvantage: "3d20kl",
};
let modifierIndex = 0;

export const defaultModifierOptions = [
  { label: "Bless [+1d4]", value: (modifierIndex++).toString() },
  { label: "Bane [-1d4]", value: (modifierIndex++).toString() },
  {
    label: "S:DS Favored by the Gods [+2d4]",
    value: (modifierIndex++).toString(),
  },
  {
    label: "C:PC Emboldening Bond [+1d4]",
    value: (modifierIndex++).toString(,
  },
  {
    label: "D:S Cosmic Omen (Weal) [+1d4]",
    value: (modifierIndex++).toString(,
  ,
];

const MODS_2_DATA = (rawModifiers: string[]) => {
  const modifierOptions: SelectItem[] = [];
  const modifiers: string[] = [];
  let index = modifierIndex;
  rawModifiers.forEach((modifier) => {
    modifierOptions.push({
      label: modifier,
      value: (++index).toString(,
    });
    modifiers.push(index.toString());
  });
  return { modifierOptions, modifiers };
};

export const PRESET_DAMAGERS = {
  "Crossbow Expert+Sharpshooter Hand Crossbow": (key: number) => {
    let { modifierOptions, modifiers } = MODS_2_DATA(["Sharpshooter [-5]"]);
    return new Damager(
      key,
      "1d6+5+10",
      1,
      "CBE/SS + Hand Crossbow",
      modifierOptions,
      modifiers
    );
  ,
};
