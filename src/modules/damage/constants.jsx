"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACs = exports.NARROW_WIDTH = exports.PRESET_DAMAGERS = exports.defaultModifierOptions = exports.ADVANTAGE_TO_DICE = void 0;
exports.ADVANTAGE_TO_DICE = {
    superadvantage: '3d20kh',
    advantage: '2d20kh',
    normal: '1d20',
    disadvantage: '2d20kl',
    superdisadvantage: '3d20kl',
};
let modifierIndex = 0;
exports.defaultModifierOptions = [
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
const MODS_2_DATA = (rawModifiers) => {
    const modifierOptions = [];
    const modifiers = [];
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
// const make_preset = (name: string, damagerType: Damager['damagerType'], rawModifiers: string[], damage: string, count: number) => (
//   (key: number) => {
//     const { modifierOptions, modifiers } = MODS_2_DATA(rawModifiers);
//     return new Damager(key, damagerType, damage, count, name, modifierOptions, modifiers);
//   });
exports.PRESET_DAMAGERS = {
// 'Crossbow Expert+Sharpshooter Hand Crossbow': make_preset(
//   'CBE/SS + Hand Crossbow',
//   'regular',
//   ['Sharpshooter [-5]'],
//   '1d6+5+10',
//   1,
// ),
// 'Eldritch Blast + Agonizing Blast': make_preset(
//   'EB + Agonizing Blast',
//   'regular',
//   [],
//   '1d10+5',
//   1,
// ),
};
exports.NARROW_WIDTH = 850;
exports.ACs = [...Array(30).keys()].map((x) => x + 1);
