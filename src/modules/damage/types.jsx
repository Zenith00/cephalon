"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Damager = exports.AdvantageTypes = void 0;
const constants_1 = require("@damage/constants");
exports.AdvantageTypes = [
    'superadvantage',
    'advantage',
    'normal',
    'disadvantage',
    'superdisadvantage',
];
class Damager {
    damage;
    damagerType;
    advantageShow;
    modifiers;
    modifierOptions;
    modifierRaws;
    atkBase;
    name;
    disabled;
    count;
    key;
    flags;
    constructor(key, damagerType, damage, count, name, modifierOptions, modifiers, flags) {
        this.damage = damage ?? '';
        this.damagerType = damagerType || 'regular';
        this.advantageShow = new Map([['normal', true]]);
        this.modifiers = [];
        this.atkBase = '0';
        this.name = name ?? '';
        this.disabled = false;
        this.key = key;
        this.count = count || 1;
        this.modifierOptions = constants_1.defaultModifierOptions.concat(...(modifierOptions || []));
        this.flags = flags || {
            pam: false, gwm: false, powerAttackOptimalOnly: false, triggersOnHit: true, advanced: { advantageMode: 'normal' },
        };
        this.modifierRaws = modifiers ?? [];
    }
}
exports.Damager = Damager;
class Player {
    key;
    name;
    attackBonus;
    modifier;
    spellSaveDC;
    elvenAccuracy;
    battleMaster;
    damagers;
    critThreshold;
    constructor(key, name, attackBonus, modifier, spellSaveDC, elvenAccuracy, battleMaster, damagers, critThreshold) {
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
exports.Player = Player;
