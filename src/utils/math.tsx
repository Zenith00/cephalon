import type { critType } from '@/damage/DamagerCard/DamagerCard';
import Fraction from 'fraction.js';

export type PMF = Map<number, Fraction>;
// export type PMF = Map<number, number>;

export const zero_pmf = () => new Map([[0, new Fraction(1)]]) as PMF;

export const boundProb = (x: Fraction, critRate: Fraction, failRate: Fraction) => {
  const NotFailRate = new Fraction(1).sub(failRate);
  const lowerBounded = x.valueOf() < critRate.valueOf() ? critRate : x;
  return lowerBounded.valueOf() > NotFailRate.valueOf() ? NotFailRate : lowerBounded;
  // return upperBounded;
  // const upperbound = x.valueOf() > (new Fraction(1).sub(failRate)).valueOf() ? (new Fraction(1).sub(failRate)) : x;
  // return upperbound.valueOf() < critRate.valueOf() ? upperbound : critRate;
};

export const printPMF = (pmf: PMF) => {
  // eslint-disable-next-line no-console
  console.log(new Map([...pmf.entries()].sort(([kl, _vl], [kr, _vr]) => kl - kr).map(([k, v]) => [k, v.valueOf().toFixed(6)])));
};

export const cumSum = (pmf: PMF) => {
  let acc = new Fraction(0);
  return new Map(
    [...pmf.entries()].sort((x) => x[0]).map(([val, p]) => [val, (acc = acc.add(p))]),
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

//
// export const pmf_min = (pmfX: PMF, pmfY: PMF) => {
//   const lowerBound = Math.min(...pmfX.keys(), ...pmfY.keys());
//   const upperBound = Math.max(...pmfX.keys(), ...pmfY.keys());
//
//   const width = upperBound - lowerBound + 1;
//   return [...Array(width).keys()]
//     .map((x) => x + lowerBound)
//     .map((n) => {
//       let l = [...Array(width - n).keys()]
//         .map((x) => x + n + 1)
//         .map((x) => (pmfX.get(n) || 0) * (pmfY.get(x) || 0));
//       // .reduce((acc, c) => acc + c, 0);
//       let r = [...Array(width - n).keys()]
//         .map((x) => x + n + 1)
//         .map((x) => (pmfX.get(x) || 0) * (pmfY.get(n) || 0));
//       // .reduce((acc, c) => acc + c, 0);
//       return [n, [...l, ...r]];
//     });
// };
//
// export const pmf_max = (pmfX: PMF, pmfY: PMF) => {
//   //
//   // const width = upperBound - lowerBound + 1;
//   // return [...Array(width).keys()]
//   //   .map((x) => x + lowerBound)
//   //   .map((n) => {
//   //     let l = [...Array(n).keys()]
//   //       .map((x) => x + 1)
//   //       .map((x) => (pmfX.get(x) || 0) * (pmfY.get(n) || 0));
//   //     // .reduce((acc, c) => acc + c, 0);
//   //     let r = [...Array(n).keys()]
//   //       .map((x) => x + 1)
//   //       .map((x) => (pmfX.get(n) || 0) * (pmfY.get(x) || 0));
//   //     // .reduce((acc, c) => acc + c, 0);
//   //     return [n, [...l, ...r], [...l, ...r].reduce((acc, c) => acc + c, 0)];
//   //   });
// };

// export const convolve_pmfs_sum = (pmfX_: PMF, pmfY_: PMF, add: boolean) => {
//   const pmfX = new Map([...pmfX_.entries()].sort());
//   const pmfY = new Map([...pmfY_.entries()].sort());
//   // const jointProb = [...Array(Math.max(...pmfX.keys()))].map(
//   //   (xDex) => [...Array(Math.max(...pmfY.keys()))].map(
//   //     (yDex) => (pmfX.get(xDex) || 0) * (pmfY.get(yDex) || 0),
//   //   ),
//   // );
//   // console.log({ jointProb });
//   const jointProb = [...pmfX.entries()].map(([_, x]) => [...pmfY.entries()].map(([__, y]) => x.valueOf() * y.valueOf()));
//
//   const diagSign = add ? 1 : -1;
//
//   const xLowerBound = Math.min(...pmfX.keys());
//   const yLowerBound = add
//     ? Math.min(...pmfY.keys())
//     : -Math.max(...pmfY.keys());
//
//   const diagExtra = add ? 0 : pmfY.size - 1;
//   const bound = (x: number) => x + xLowerBound + yLowerBound;
//
//   return [...Array(pmfX.size + pmfY.size - 1).keys()].reduce(
//     (acc, diagDex) => acc.set(
//       bound(diagDex),
//       [...Array(pmfX.size + pmfY.size).keys()]
//         .map(
//           (i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? 0,
//         )
//         .reduce((l, r) => l + r),
//     ),
//     new Map(),
//   );
// };

export const convolve_pmfs_sum_2 = (pmfX_: PMF, pmfY_: PMF, add: boolean) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());
  const pmfXMax = Math.max(...pmfX.keys());
  const pmfYMax = Math.max(...pmfY.keys());
  const jointProb = [...Array(pmfXMax + 1).keys()].map(
    (xDex) => [...Array(pmfYMax + 1).keys()].map(
      (yDex) => (pmfX.get(xDex) || new Fraction(0)).mul(pmfY.get(yDex) || new Fraction(0)),
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
          (i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? new Fraction(0),
        )
        .reduce((l, r) => l.add(r)),
    ),
    new Map(),
  ) as PMF;
};
export const convolve_pmfs_prod = (pmfX_: PMF, pmfY_: PMF) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());

  // console.log(pmfX);
  // console.log(pmfY);
  // const jointProb = [...pmfX.entries()].map(([k, x]) => [...pmfY.entries()].map(([k, y]) => x.valueOf() * y.valueOf()));
  const pmf = new Map<number, Fraction>() as PMF;
  [...pmfX.entries()].forEach(([xKey, xVal]) => [...pmfY.entries()].forEach(([yKey, yVal]) => {
    pmf.set(xKey * yKey, (pmf.get(xKey * yKey) || new Fraction(0)).add(xVal.mul(yVal)));
  }));
  return pmf;
};

export const one_or_other_pmfs = (pmfX: PMF, pmfY: PMF, pX: Fraction, pY: Fraction) => {
  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
  [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || new Fraction(0)).mul(pX).add((pmfY.get(k) || new Fraction(0)).mul(pY))));

  return pmf;
};
const pmfMax = (pmf1: PMF, pmf2: PMF) => {
  const pmfResult = new Map<number, Fraction>() as PMF;
};
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
  return [new Map([[Number(count), new Fraction(1)]])];
};

// console.log(diceToPMFs('2'));

export const d20ToCritrate = (dice: string, critThreshold: number) : Fraction => {
  // console.log({ dice });
  const [countS, fullFace] = dice.split('d');
  const count = Number(countS);

  if (fullFace.endsWith('kh') || fullFace.endsWith('kl')) {
    switch (fullFace.slice(-2)) {
      case 'kh':
        return new Fraction(1).sub(new Fraction((critThreshold - 1), 20)).pow(count);
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

export const isSimpleProcessable = (damage: string) => Boolean(/^[\dd+\-khl(mod)]+$/.test(damage.replaceAll(/\s/g, '')));

export const simpleProcess = (
  damage: string,
  crit: critType = 'none',
): PMF | undefined => {
  let state: 'pos' | 'neg' = 'pos';
  const clean = damage.replaceAll(/\s/g, '');
  if (!/^[\dd+\-khl]+$/.test(clean)) {
    return undefined;
  }

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

  let pmf = (dice.pos || [])
    .filter((x) => x)
    .map(diceToPMFs)
    .flat()
    .map((x: PMF) => x)
    .reduce((acc, c) => convolve_pmfs_sum_2(acc, c, true), new Map([[0, new Fraction(1)]]));

  pmf = (dice.neg || [])
    .filter((x) => x)
    .map(diceToPMFs)
    .flat()
    .map((x: PMF) => x)
    .reduce((acc, c) => convolve_pmfs_sum_2(acc, c, false), pmf);

  return pmf;
};

// export const add_pmfs = (pmfX: PMF, pmfY: PMF) => new Map(
//   [...pmfX.keys(), ...pmfY.keys()].map((key) => [key, (pmfX.get(key) || 0) + (pmfY.get(key) || 0)]),
// );

// export const multiply_pmf = (pmf: PMF, constant: number) => new Map([...pmf.entries()].map(([k, v]) => [k, v * constant]));

export const weighted_mean_pmf = (pmf: PMF) => [...pmf.entries()].reduce(
  (acc, [d, p]) => (acc.add(new Fraction(d).mul(p))),
  new Fraction(0),
);
// export const convolve_pmfs_2 = (pmfX: PMF, pmfY: PMF, add: boolean) => {
//   const jointProb = [...pmfX.entries()].map(([k, x]) => [...pmfY.entries()].map(([k, y]) => x.valueOf() * y.valueOf()));
//
//   // console.log(jointProb);
//   const diagSign = add ? 1 : -1;
//
//   const xLowerBound = Math.min(...pmfX.keys());
//   const yLowerBound = add
//     ? Math.min(...pmfY.keys())
//     : -Math.max(...pmfY.keys());
//
//   const diagExtra = add ? 0 : pmfY.size - 1;
//   const bound = (x: number) => x + xLowerBound + yLowerBound;
//
//   return [...Array(pmfX.size + pmfY.size + 2).keys()].reduce(
//     (acc, diagDex) => acc.set(
//       bound(diagDex),
//       [...Array(pmfX.size + pmfY.size).keys()]
//         .map(
//           (i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? 0,
//         )
//         .reduce((l, r) => l + r),
//     ),
//     new Map(),
//   );
//   // return diag_sum(matrix);
// };
const onehit = new Map([
  [0, 0.75],
  [1, 0.0417],
  [2, 0.0417],
  [3, 0.0417],
  [4, 0.0417],
  [5, 0.0417],
  [6, 0.0417],
]);

// const crit = new Map([
//   []
// ])

const x = [
  [
    0,
    0.3,
  ],
  [
    1,
    0,
  ],
  [
    2,
    0.10833333333333334,
  ],
  [
    3,
    0.21666666666666667,
  ],
  [
    4,
    0.21805555555555556,
  ],
  [
    5,
    0.11388888888888889,
  ],
  [
    6,
    0.011111111111111112,
  ],
  [
    7,
    0.013888888888888888,
  ],
  [
    8,
    0.011111111111111112,
  ],
  [
    9,
    0.005555555555555556,
  ],
  [
    10,
    0.001388888888888889,
  ],
];

// console.log(convolve_pmfs_sum(
//   new Map([[0, 0.3], [2, 0.175], [3, 0.35], [4, 0.175]]),
//   new Map([[0, 0.95], [2, 0.0125], [3, 0.025], [4, 0.0125]]),
//   true,
// ));
const v = convolve_pmfs_sum_2(
  new Map(x.map(([l, r]) => [l, new Fraction(r)])),
  new Map([[2, new Fraction(1)]]),
  true,
);

// console.log([...v.entries()].sort(([aK, _], [bK, __]) => aK - bK).map(([k, v]) => [k, v.valueOf()]));
