"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fraction_js_1 = __importDefault(require("fraction.js"));
const constants_1 = require("@damage/constants");
const math_1 = require("@utils/math");
const workerpool_1 = __importDefault(require("workerpool"));
const cumSumHits = (pmf) => {
    let acc = new fraction_js_1.default(0);
    return new Map(
    // eslint-disable-next-line no-return-assign
    [...pmf.entries()].sort((x) => x[0]).map(([val, p]) => [val + 1, (acc = acc.add(p))]));
};
const make_pmf = (diceFace, advantage = 0) => {
    if (advantage === 0) {
        return new Map([...Array(diceFace).keys()].map((i) => [i + 1, new fraction_js_1.default(1, diceFace)]));
    }
    const A = Math.abs(advantage) + 1;
    const x = [...Array(diceFace).keys()]
        .map((v) => v + 1)
        .map((v) => [v, new fraction_js_1.default((v ** A - (v - 1) ** A), diceFace ** A)]);
    return new Map([...x.map(([k, v]) => [advantage > 0 ? k : diceFace - k + 1, v])].sort(([kl, _], [kr, __]) => (kl < kr ? -1 : 1)));
};
const convolve_pmfs_sum_2 = (pmfX_, pmfY_, add) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const pmfXMax = Math.max(...pmfX.keys());
    const pmfYMax = Math.max(...pmfY.keys());
    const jointProb = [...Array(pmfXMax + 1).keys()].map((xDex) => [...Array(pmfYMax + 1).keys()].map((yDex) => (pmfX.get(xDex) || new fraction_js_1.default(0)).mul(pmfY.get(yDex) || new fraction_js_1.default(0))));
    const diagSign = add ? 1 : -1;
    const diagExtra = add ? 0 : pmfYMax - 1;
    const bound = (x) => x;
    return [...Array(pmfXMax + pmfYMax + 2 - 1).keys()].reduce((acc, diagDex) => acc.set(bound(diagDex), [...Array(pmfXMax + pmfYMax + 2).keys()]
        .map((i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? new fraction_js_1.default(0))
        .reduce((l, r) => l.add(r))), new Map());
};
const convolve_pmfs_prod = (pmfX_, pmfY_) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const pmf = new Map();
    [...pmfX.entries()].forEach(([xKey, xVal]) => [...pmfY.entries()].forEach(([yKey, yVal]) => {
        pmf.set(xKey * yKey, (pmf.get(xKey * yKey) || new fraction_js_1.default(0)).add(xVal.mul(yVal)));
    }));
    return pmf;
};
const one_or_other_pmfs = (pmfX, pmfY, pX, pY) => {
    const pmf = new Map();
    const keySet = new Set([...pmfX.keys(), ...pmfY.keys()]);
    [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || new fraction_js_1.default(0)).mul(pX).add((pmfY.get(k) || new fraction_js_1.default(0)).mul(pY))));
    return pmf;
};
const pmfMax = (pmf1, pmf2) => {
    const pmfResult = new Map();
};
const diceToPMFs = (dice) => {
    const [count, face] = dice.split('d');
    if (face) {
        if (face.endsWith('kh') || face.endsWith('kl')) {
            const c = Number(count) - 1;
            return [
                make_pmf(Number(face.slice(0, -2)), face.endsWith('kh') ? c : -c),
            ];
        }
        return [...Array(Number(count) || 1).keys()].map((_) => make_pmf(Number(face)));
    }
    return [new Map([[Number(count), new fraction_js_1.default(1)]])];
};
// console.log(diceToPMFs('2'));
const d20ToCritrate = (dice, critThreshold) => {
    // console.log({ dice });
    const [countS, fullFace] = dice.split('d');
    const count = Number(countS);
    if (fullFace.endsWith('kh') || fullFace.endsWith('kl')) {
        switch (fullFace.slice(-2)) {
            case 'kh':
                return new fraction_js_1.default(1).sub(new fraction_js_1.default((critThreshold - 1), 20)).pow(count);
            case 'kl':
                return new fraction_js_1.default((new fraction_js_1.default(21).sub(new fraction_js_1.default(critThreshold))), 20).pow(count);
            default:
                break;
        }
    }
    return new fraction_js_1.default(1, 20);
};
const d20ToFailRate = (dice) => {
    const [countS, fullFace] = dice.split('d');
    const count = Number(countS);
    if (fullFace.endsWith('kh') || fullFace.endsWith('kl')) {
        switch (fullFace.slice(-2)) {
            case 'kl':
                return d20ToCritrate(`${dice.slice(0, -2)}kh`, 20);
            case 'kh':
                return d20ToCritrate(`${dice.slice(0, -2)}kl`, 20);
            default:
                break;
        }
    }
    return new fraction_js_1.default(1 / 20);
};
const isSimpleProcessable = (damage) => Boolean(/^([\dd+\-khl]|(mod))+$/.test(damage.replaceAll(/\s/g, '')));
const damageStringToPMF = (damage, crit = 'none') => {
    let state = 'pos';
    const clean = (damage).replaceAll(/\s/g, '');
    if (!/^[\dd+\-khl]+$/.test(clean)) {
        return undefined;
    }
    let dice = {
        pos: [],
        neg: [],
    };
    let dice_acc = '';
    [...clean].forEach((c) => {
        if (c === '-' || c === '+') {
            // if (dice_acc) {
            dice[state].push(dice_acc);
            dice_acc = '';
            // }
            state = c === '-' ? 'neg' : 'pos';
        }
        else {
            dice_acc += c;
        }
    });
    dice[state].push(dice_acc);
    if (crit === 'normal') {
        dice = Object.fromEntries([Object.entries(dice)].map(([[posneg, d]]) => [
            posneg,
            d.map((x) => {
                if (x.includes('d')) {
                    const [count, face] = x.split('d');
                    return `${Number(count)}d${face}`;
                }
                return undefined;
            }).filter((v) => v),
        ]) || []);
    }
    let pmf = (dice.pos || [])
        .filter((x) => x)
        .map(diceToPMFs)
        .flat()
        .map((x) => x)
        .reduce((acc, c) => convolve_pmfs_sum_2(acc, c, true), new Map([[0, new fraction_js_1.default(1)]]));
    pmf = (dice.neg || [])
        .filter((x) => x)
        .map(diceToPMFs)
        .flat()
        .map((x) => x)
        .reduce((acc, c) => convolve_pmfs_sum_2(acc, c, false), pmf);
    return pmf;
};
function computeMissChance(toHitCumulative, advType, ac, critRate, failRate) {
    return (0, math_1.boundProb)(toHitCumulative.get(ac) || new fraction_js_1.default(1), critRate, failRate);
}
function computeFinalPMF(advType, ac, missChance, critRate, failRate, damageString, count) {
    const simpleDamagePMF = (0, math_1.simpleProcess)(damageString);
    const simpleCritBonusPMF = (0, math_1.simpleProcess)(damageString, 'normal');
    const hitChance = new fraction_js_1.default(1).sub(missChance);
    const critFactor = missChance.equals(1) ? critRate : critRate.div(hitChance);
    const critBonusPMF = convolve_pmfs_prod(simpleCritBonusPMF, new Map([[0, new fraction_js_1.default(1).sub(critFactor)], [1, critFactor]]));
    const fullPMF = convolve_pmfs_sum_2(simpleDamagePMF, critBonusPMF, true);
    const hitChanceAwareDamagePMF = convolve_pmfs_prod(fullPMF, new Map([[0, missChance], [1, hitChance]]));
    return [...Array(count - 1).keys()].reduce((acc) => convolve_pmfs_sum_2(acc, hitChanceAwareDamagePMF, true), hitChanceAwareDamagePMF);
}
function computeFinalPMF2(advType, ac, missChance, critRate, failRate, damageString) {
    const simpleDamagePMF = (0, math_1.simpleProcess)(damageString);
    const simpleCritBonusPMF = (0, math_1.simpleProcess)(damageString, 'raw');
    (0, math_1.printPMF)(simpleCritBonusPMF);
    const regularHitChance = new fraction_js_1.default(1).sub(missChance).sub(critRate);
    const finalPMF = (0, math_1.one_or_three_pmfs)(simpleDamagePMF, simpleCritBonusPMF, new Map([[0, new fraction_js_1.default(1)]]), regularHitChance, critRate, missChance);
    (0, math_1.printPMF)(finalPMF);
    // console.log(weighted_mean_pmf(finalPMF).toString(6));
    return finalPMF;
}
const x = computeFinalPMF2('normal', 14, new fraction_js_1.default(0.4), new fraction_js_1.default(0.05), new fraction_js_1.default(0.05), '1d12+5');
// const computeRawDamagePMF = (damageString:string, critThreshold: number) => {
//     const simpleDamagePMF = simpleProcess(damageString)!;
//   const simpleCritBonusPMF = simpleProcess(damageString, 'normal')!;
// }
function computeToHitCumulative(player, damager, advType) {
    const playerAttackBonus = player.attackBonus >= 0
        ? `+${player.attackBonus}`
        : `${player.attackBonus}`;
    // const damagerDamage = damager.damage.replace('mod', player.modifier?.toString() || '0');
    const simpleAttackPMFs = (0, math_1.simpleProcess)(`${constants_1.ADVANTAGE_TO_DICE[advType]} ${playerAttackBonus} ${damager.modifiers
        .map((m) => (['+', '-'].includes(m[0]) ? m : `+${m}`))
        .join(' ')}`);
    return cumSumHits(simpleAttackPMFs);
}
const computeDamageInfo = (damager, advType, player, toHitCumulativeOverride) => {
    const toHitCumulative = toHitCumulativeOverride ?? computeToHitCumulative(player, damager, advType);
    const critRate = d20ToCritrate(constants_1.ADVANTAGE_TO_DICE[advType], player.critThreshold);
    const failRate = d20ToFailRate(constants_1.ADVANTAGE_TO_DICE[advType]);
    return constants_1.ACs.reduce((damageMap, ac) => {
        // if (damager.damagerType === 'onHit') {
        //   const onHitTriggeringAllMiss = Object.values(player.damagers).filter((d) => d.flags.triggersOnHit).map((thisDamager) => {
        //     const damagerAttackCumSum = computeToHitCumulative(player, thisDamager, advType).toHitCumulative;
        //     const damagerAdvType = [...thisDamager.advantageShow.entries()].filter(([_, show]) => show)[0][0];
        //     return computeMissChance(damagerAttackCumSum, damagerAdvType, ac, critRate, failRate).pow(thisDamager.count);
        //   }).reduce((acc, n) => acc.mul(n), new Fraction(1));
        //
        //   const firstHitPMF = computeFinalPMF(advType, ac, onHitTriggeringAllMiss, critRate, failRate, damagerDamage, 1);
        //   damageMap.set(ac, firstHitPMF);
        // } else {
        const missChance = computeMissChance(toHitCumulative, advType, ac, critRate, failRate);
        const singleHitFinalDamagePMF = computeFinalPMF2(advType, ac, missChance, critRate, failRate, damager.damage);
        const finalDamagePMF = [...new Array(damager.count).keys()].reduce((acc, n) => convolve_pmfs_sum_2(singleHitFinalDamagePMF, acc, true), new Map([[0, new fraction_js_1.default(1)]]));
        damageMap.set(ac, finalDamagePMF);
        return damageMap;
    }, new Map());
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
workerpool_1.default.worker({
    computeDamageInfo,
    computeToHitCumulative,
});
