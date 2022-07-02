// import type { critType } from '@/damage/DamagerCard/DamagerCard';
import Fraction from 'fraction.js';
import memoize from 'lodash.memoize';

export type critType = 'none' | 'normal' | 'maximized' | 'raw';

export type PMF = Map<number, Fraction>;

export const zero_pmf = () => new Map([[0, ONE]]) as PMF;

const ZERO = new Fraction(0);
const ONE = new Fraction(1);

export const boundProb = (missChance: Fraction, critRate: Fraction, failRate: Fraction) => {
  console.log(`Bounding ${missChance.toString(3)} to ${critRate.toString(3)}-${failRate.toString(3)}`);
  if (missChance.valueOf() < failRate.valueOf()) {
    return failRate;
  } if (missChance.valueOf() > ONE.sub(critRate).valueOf()) {
    return ONE.sub(critRate);
  }
  return missChance;
  // const NotFailRate = ONE.sub(failRate);
  // const lowerBounded = missChance.valueOf() < critRate.valueOf() ? critRate : missChance;
  // console.log(`Lower bound: ${lowerBounded.toString(3)}`);
  // return lowerBounded.valueOf() > NotFailRate.valueOf() ? NotFailRate : lowerBounded;
};

export const printPMF = (pmf: PMF) => {
  // eslint-disable-next-line no-console
  console.log(new Map([...pmf.entries()].sort(([kl, _vl], [kr, _vr]) => kl - kr).map(([k, v]) => [k, v.valueOf().toFixed(6)])));
};

export const cumSumHits = (pmf: PMF) => {
  let acc = ZERO;
  return new Map(
    [...pmf.entries()].sort((x) => x[0]).map(([val, p]) => [val + 1, (acc = acc.add(p))]),
  );
};

export const make_pmf = (diceFace: number, advantage = 0) : PMF => {
  if (advantage === 0) {
    return new Map(
      [...Array(diceFace).keys()].map((i) => [i + 1, new Fraction(1, diceFace)]),
    );
  }
  const A = Math.abs(advantage) + 1;
  const x = [...Array(diceFace).keys()]
    .map((v) => v + 1)
    .map((v) => [v, new Fraction((v ** A - (v - 1) ** A), diceFace ** A)] as [number, Fraction]);

  return new Map(
      [...x.map(([k, v]) => [advantage > 0 ? k : diceFace - k + 1, v])].sort(
        ([kl, _], [kr, __]) => (kl < kr ? -1 : 1),
      ) as [number, Fraction][],
  );
};

export const convolve_pmfs_sum_2 = (pmfX_: PMF, pmfY_: PMF, add: boolean) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());
  const pmfXMax = Math.max(...pmfX.keys());
  const pmfYMax = Math.max(...pmfY.keys());
  const jointProb = [...Array(pmfXMax + 1).keys()].map(
    (xDex) => [...Array(pmfYMax + 1).keys()].map(
      (yDex) => (pmfX.get(xDex) || ZERO).mul(pmfY.get(yDex) || ZERO),
    ),
  );

  const diagSign = add ? 1 : -1;

  const diagExtra = add ? 0 : pmfYMax - 1;
  const bound = (x: number) => x;
  return [...Array(pmfXMax + pmfYMax + 2 - 1).keys()].reduce(
    (acc, diagDex) => acc.set(
      bound(diagDex),
      [...Array(pmfXMax + pmfYMax + 2).keys()]
        .map(
          (i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? ZERO,
        )
        .reduce((l, r) => l.add(r)),
    ),
    new Map(),
  ) as PMF;
};
export const convolve_pmfs_prod = (pmfX_: PMF, pmfY_: PMF) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());

  const pmf = new Map<number, Fraction>() as PMF;
  [...pmfX.entries()].forEach(([xKey, xVal]) => [...pmfY.entries()].forEach(([yKey, yVal]) => {
    pmf.set(xKey * yKey, (pmf.get(xKey * yKey) || ZERO).add(xVal.mul(yVal)));
  }));
  return pmf;
};

export const one_or_other_pmfs = (pmfX: PMF, pmfY: PMF, pX: Fraction, pY: Fraction) => {
  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
  [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || ZERO).mul(pX).add((pmfY.get(k) || ZERO).mul(pY))));

  return pmf;
};

export const one_or_three_pmfs = (pmfX: PMF, pmfY: PMF, pmfZ: PMF, pX: Fraction, pY: Fraction, pZ: Fraction) => {
  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys(), ...pmfZ.keys()]);
  [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || ZERO).mul(pX).add((pmfY.get(k) || ZERO).mul(pY)).add((pmfZ.get(k) || ZERO).mul(pZ))));

  return pmf;
};
const pmfMax = (pmfX_: PMF, pmfY_: PMF) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());

  const getGT = (pmf: PMF, than: number) : Fraction => [...pmf.values()].slice(0, [...pmf.keys()].indexOf(than)).reduce((acc, n) => acc.add(n), ZERO);
  const pmfResult = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
  keySet.forEach((key) => {
    console.log({ key });
    console.log(getGT(pmfX, key).mul(pmfX.get(key) || ONE).toString(3));
    console.log(getGT(pmfY, key).mul(pmfY.get(key) || ONE).toString(3));
    const xkey_ykey = (pmfX.get(key) || ZERO).mul(pmfY.get(key) || ZERO);
    pmfResult.set(key, getGT(pmfX, key).mul(pmfX.get(key) || ONE).add(getGT(pmfY, key).mul(pmfY.get(key) || ONE)).add(xkey_ykey));
  });
  return pmfResult;
};

const pmfMin = (pmfX_: PMF, pmfY_: PMF) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());

  const getGT = (pmf: PMF, than: number) : Fraction => [...pmf.values()].slice([...pmf.keys()].indexOf(than) + 1).reduce((acc, n) => acc.add(n), ZERO);
  console.log(getGT(pmfX, 2).toString(3));
  const pmfResult = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
  keySet.forEach((key) => {
    console.log({ key });
    console.log(getGT(pmfX, key).mul(pmfX.get(key) || ONE).toString(3));
    console.log(getGT(pmfY, key).mul(pmfY.get(key) || ONE).toString(3));
    const xkey_ykey = (pmfX.get(key) || ZERO).mul(pmfY.get(key) || ZERO);
    pmfResult.set(key, getGT(pmfX, key).mul(pmfX.get(key) || ONE).add(getGT(pmfY, key).mul(pmfY.get(key) || ONE)).add(xkey_ykey));
  });
  return pmfResult;
};

// export const pmf_max = (pmfX: PMF, pmfY: PMF) => {
//   const keySet = [...new Set<number>([...pmfX.keys(), ...pmfY.keys()])].sort();
//
//   const width = keySet[keySet.length - 1] + 2;
//   console.log({ keySet });
//   console.log(keySet.slice(0, keySet.indexOf(2)));
//   return keySet
//     .map((n) => {
//       const l = keySet.slice(keySet.indexOf(n))
//         .map((x) => (pmfX.get(x) || ZERO)).reduce((acc, c) => acc.add(c), ZERO);
//       const r = keySet.slice(keySet.indexOf(n))
//         .map((y) => (pmfY.get(y) || ZERO));
//       return [n, [...l, ...r].reduce((acc, c) => acc.add(c), ZERO).toString(4)];
//     });
// };
printPMF(pmfMax(make_pmf(7), make_pmf(7)));

export const diceToPMFs = (dice: string) : PMF[] => {
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
  return [new Map([[Number(count), ONE]])];
};

// console.log(diceToPMFs('2'));

export const d20ToCritrate = (dice: string, critThreshold: number) : Fraction => {
  // console.log({ dice });
  const [countS, fullFace] = dice.split('d');
  const count = Number(countS);

  if (fullFace.endsWith('kh') || fullFace.endsWith('kl')) {
    switch (fullFace.slice(-2)) {
      case 'kh':
        return ONE.sub(new Fraction((critThreshold - 1), 20).pow(count));
      case 'kl':
        return new Fraction((new Fraction(21).sub(new Fraction(critThreshold))), 20).pow(count);
      default:
        break;
    }
  }
  return new Fraction(1, 20);
};

export const d20ToFailRate = (dice: string) => {
  // console.log({ dice });
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
  return new Fraction(1 / 20);
};

console.log('fail');
console.log(d20ToCritrate('2d20kh', 20));

export const isSimpleProcessable = (damage: string) => Boolean(/^([\dd+\-khl]|(mod))+$/.test(damage.replaceAll(/\s/g, '')));

export const simpleProcess = memoize((
  damage: string,
  crit: critType = 'none',
): PMF => {
  let state: 'pos' | 'neg' = 'pos';
  const clean = (damage).replaceAll(/\s/g, '');

  let dice = {
    pos: [],
    neg: [],
  } as {
    pos: string[];
    neg: string[];
  };

  let dice_acc = '';

  [...clean].forEach((c) => {
    if (c === '-' || c === '+') {
      // if (dice_acc) {
      dice[state].push(dice_acc);
      dice_acc = '';
      // }
      state = c === '-' ? 'neg' : 'pos';
    } else {
      dice_acc += c;
    }
  });
  dice[state].push(dice_acc);
  if (crit === 'normal') {
    dice = Object.fromEntries(
      [Object.entries(dice)].map(([[posneg, d]]) => [
        posneg,
        d.map((x) => {
          if (x.includes('d')) {
            const [count, face] = x.split('d');
            return `${Number(count)}d${face}`;
          }
          return undefined;
          // return x;
        }).filter((v) => v),
      ]) || [],
    ) as {
      pos: string[];
      neg: string[];
    };
  }
  if (crit === 'raw') {
    dice = Object.fromEntries(
      [Object.entries(dice)].map(([[posneg, d]]) => [
        posneg,
        d.map((x) => {
          if (x.includes('d')) {
            const [count, face] = x.split('d');
            return `${Number(count) * 2}d${face}`;
          }
          return x;
        }).filter((v) => v),
      ]) || [],
    ) as {
      pos: string[];
      neg: string[];
    };
  }

  // console.log(dice);
  let pmf = (dice.pos || [])
    .filter((x) => x)
    .map(diceToPMFs)
    .flat()
    .map((x: PMF) => x)
    .reduce((acc, c) => convolve_pmfs_sum_2(acc, c, true), new Map([[0, ONE]]));

  pmf = (dice.neg || [])
    .filter((x) => x)
    .map(diceToPMFs)
    .flat()
    .map((x: PMF) => x)
    .reduce((acc, c) => convolve_pmfs_sum_2(acc, c, false), pmf);

  // printPMF(pmf);
  return pmf;
}, (damage, crit) => `${damage}|${crit || ''}`);

export const weighted_mean_pmf = (pmf: PMF) => [...pmf.entries()].reduce(
  (acc, [d, p]) => (acc.add(new Fraction(d).mul(p))),
  ZERO,
);
