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
    value: (modifierIndex++).toString(),
  },
  {
    label: "D:S Cosmic Omen (Weal) [+1d4]",
    value: (modifierIndex++).toString(),
  },
];
