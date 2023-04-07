"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weighted_mean_pmf = exports.simpleProcess = exports.isSimpleProcessable = exports.d20ToFailRate = exports.d20ToCritrate = exports.diceToPMFs = exports.one_or_three_pmfs = exports.one_or_other_pmfs = exports.convolve_pmfs_prod = exports.convolve_pmfs_sum_2 = exports.make_pmf = exports.cumSumHits = exports.printPMF = exports.boundProb = exports.zero_pmf = void 0;
// import type { critType } from '@/damage/DamagerCard/DamagerCard';
const fraction_js_1 = __importDefault(require("fraction.js"));
const lodash_memoize_1 = __importDefault(require("lodash.memoize"));
const zero_pmf = () => new Map([[0, new fraction_js_1.default(1)]]);
exports.zero_pmf = zero_pmf;
const boundProb = (x, critRate, failRate) => {
    const NotFailRate = new fraction_js_1.default(1).sub(failRate);
    const lowerBounded = x.valueOf() < critRate.valueOf() ? critRate : x;
    return lowerBounded.valueOf() > NotFailRate.valueOf() ? NotFailRate : lowerBounded;
};
exports.boundProb = boundProb;
const printPMF = (pmf) => {
    // eslint-disable-next-line no-console
    console.log(new Map([...pmf.entries()].sort(([kl, _vl], [kr, _vr]) => kl - kr).map(([k, v]) => [k, v.valueOf().toFixed(6)])));
};
exports.printPMF = printPMF;
const cumSumHits = (pmf) => {
    let acc = new fraction_js_1.default(0);
    return new Map([...pmf.entries()].sort((x) => x[0]).map(([val, p]) => [val + 1, (acc = acc.add(p))]));
};
exports.cumSumHits = cumSumHits;
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
exports.make_pmf = make_pmf;
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
exports.convolve_pmfs_sum_2 = convolve_pmfs_sum_2;
const convolve_pmfs_prod = (pmfX_, pmfY_) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const pmf = new Map();
    [...pmfX.entries()].forEach(([xKey, xVal]) => [...pmfY.entries()].forEach(([yKey, yVal]) => {
        pmf.set(xKey * yKey, (pmf.get(xKey * yKey) || new fraction_js_1.default(0)).add(xVal.mul(yVal)));
    }));
    return pmf;
};
exports.convolve_pmfs_prod = convolve_pmfs_prod;
const one_or_other_pmfs = (pmfX, pmfY, pX, pY) => {
    const pmf = new Map();
    const keySet = new Set([...pmfX.keys(), ...pmfY.keys()]);
    [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || new fraction_js_1.default(0)).mul(pX).add((pmfY.get(k) || new fraction_js_1.default(0)).mul(pY))));
    return pmf;
};
exports.one_or_other_pmfs = one_or_other_pmfs;
const one_or_three_pmfs = (pmfX, pmfY, pmfZ, pX, pY, pZ) => {
    const pmf = new Map();
    const keySet = new Set([...pmfX.keys(), ...pmfY.keys(), ...pmfZ.keys()]);
    [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || new fraction_js_1.default(0)).mul(pX).add((pmfY.get(k) || new fraction_js_1.default(0)).mul(pY)).add((pmfZ.get(k) || new fraction_js_1.default(0)).mul(pZ))));
    return pmf;
};
exports.one_or_three_pmfs = one_or_three_pmfs;
const pmfMax = (pmf1, pmf2) => {
    const pmfResult = new Map();
};
const diceToPMFs = (dice) => {
    const [count, face] = dice.split('d');
    if (face) {
        if (face.endsWith('kh') || face.endsWith('kl')) {
            const c = Number(count) - 1;
            return [
                (0, exports.make_pmf)(Number(face.slice(0, -2)), face.endsWith('kh') ? c : -c),
            ];
        }
        return [...Array(Number(count) || 1).keys()].map((_) => (0, exports.make_pmf)(Number(face)));
    }
    return [new Map([[Number(count), new fraction_js_1.default(1)]])];
};
exports.diceToPMFs = diceToPMFs;
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
exports.d20ToCritrate = d20ToCritrate;
const d20ToFailRate = (dice) => {
    // console.log({ dice });
    const [countS, fullFace] = dice.split('d');
    const count = Number(countS);
    if (fullFace.endsWith('kh') || fullFace.endsWith('kl')) {
        switch (fullFace.slice(-2)) {
            case 'kl':
                return (0, exports.d20ToCritrate)(`${dice.slice(0, -2)}kh`, 20);
            case 'kh':
                return (0, exports.d20ToCritrate)(`${dice.slice(0, -2)}kl`, 20);
            default:
                break;
        }
    }
    return new fraction_js_1.default(1 / 20);
};
exports.d20ToFailRate = d20ToFailRate;
const isSimpleProcessable = (damage) => Boolean(/^([\dd+\-khl]|(mod))+$/.test(damage.replaceAll(/\s/g, '')));
exports.isSimpleProcessable = isSimpleProcessable;
exports.simpleProcess = (0, lodash_memoize_1.default)((damage, crit = 'none') => {
    let state = 'pos';
    const clean = (damage).replaceAll(/\s/g, '');
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
                // return x;
            }).filter((v) => v),
        ]) || []);
    }
    if (crit === 'raw') {
        dice = Object.fromEntries([Object.entries(dice)].map(([[posneg, d]]) => [
            posneg,
            d.map((x) => {
                if (x.includes('d')) {
                    const [count, face] = x.split('d');
                    return `${Number(count) * 2}d${face}`;
                }
                return x;
            }).filter((v) => v),
        ]) || []);
    }
    // console.log(dice);
    let pmf = (dice.pos || [])
        .filter((x) => x)
        .map(exports.diceToPMFs)
        .flat()
        .map((x) => x)
        .reduce((acc, c) => (0, exports.convolve_pmfs_sum_2)(acc, c, true), new Map([[0, new fraction_js_1.default(1)]]));
    pmf = (dice.neg || [])
        .filter((x) => x)
        .map(exports.diceToPMFs)
        .flat()
        .map((x) => x)
        .reduce((acc, c) => (0, exports.convolve_pmfs_sum_2)(acc, c, false), pmf);
    // printPMF(pmf);
    return pmf;
}, (damage, crit) => `${damage}|${crit || ''}`);
const weighted_mean_pmf = (pmf) => [...pmf.entries()].reduce((acc, [d, p]) => (acc.add(new fraction_js_1.default(d).mul(p))), new fraction_js_1.default(0));
exports.weighted_mean_pmf = weighted_mean_pmf;
