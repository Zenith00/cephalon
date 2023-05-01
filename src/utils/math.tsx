// import type { critType } from '@/damage/DamagerCard/DamagerCard';
import type { AC } from "@/damage/types";
import Fraction from "fraction.js";
import memoize from "lodash.memoize";
import { table } from "table";

export type critType = "none" | "normal" | "maximized" | "raw";

export type PMF = Map<number, Fraction>;

export const ZERO = new Fraction(0);
export const ONE = new Fraction(1);
export const EMPTY_PMF = new Map([[0, ONE]]);

export const zero_pmf = () => new Map([[0, ONE]]) as PMF;

export const shiftPMF = (pmf: PMF, shift: number) =>
  new Map([...pmf.entries()].map(([k, v]) => [k + shift, v]));
export const clean_zeros = (pmf: PMF): PMF =>
  new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));

export const clean_jpm = (map: Map<string, PMF>) =>
  new Map([...map.entries()].filter(([_, v]) => v.size !== 0));
// export const clean_zeros = (pmf: Map<AC, Fraction>): PMF =>
//   new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));

// export const clean_probmap = (obj: { [k: string]: Fraction }) =>
//   Object.fromEntries(Object.entries(obj).filter(([k, v]) => !v.equals(ZERO)));

// export const clean_jpm = (obj: { [k: string]: { [k: string]: Fraction } }) =>
//   Object.fromEntries(
//     Object.entries(obj).filter(([k, v]) => Object.keys(v).length !== 0)
//   );

export type Dice = {
  positive: boolean;
  count: number;
  face: number;
  op?: "kh" | "kl";
  dice: boolean;
};

export type PMFDice = {
  pmf: PMF;
} & Dice;

export type Formula = {
  dice: Dice[];
};
export type PMFFormula = {
  dice: Dice[];
  pmf: PMF;
};

export const boundHitChance = (hitChance: Fraction): Fraction => {
  if (hitChance < ZERO) {
    return ZERO;
  }
  if (hitChance > ONE) {
    return ONE;
  }
  return hitChance;
};

export const parseDiceStrings = ({
  diceStrings,
  crit,
}: {
  diceStrings: string[];
  crit?: "raw";
}): Formula => {
  const dice = diceStrings
    .map((damage) =>
      [
        ...damage.matchAll(
          /(?<sign>[+-]?)?(?<count>\d*)((?<dice>d)(?<face>\d+)(?<op>kh|kl)?)?/gi
        ),
      ]
        .filter((match) => match[0])
        .map((match) => {
          const g = match.groups;
          return {
            positive: !g?.sign?.includes("-"),
            count: Number(g?.count?.trim() ?? 1),
            face: Number(g?.face?.trim()),
            op: g?.op,
            dice: !!g?.dice,
          } as Dice;
        })
    )
    .flat();

  dice.forEach((d) => {
    if (crit === "raw" && d.dice) {
      // eslint-disable-next-line no-param-reassign
      d.count *= 2;
    }
  });
  return { dice };
};

export const numberRange = (start: number, end: number): number[] =>
  new Array(end - start).fill(undefined).map((d, i) => i + start);

export const add_pmfs = (pmfX_: PMF, pmfY_: PMF, add: boolean) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());

  const absMin =
    Math.min(...pmfX.keys(), ...pmfY.keys()) -
    (add ? 0 : Math.max(...pmfY.keys()));

  const absMax = Math.max(...pmfX.keys()) + Math.max(...pmfY.keys());

  const R = numberRange(absMin, absMax + 1);

  const jointProbMap = clean_jpm(
    new Map(
      R.map((valX) => [
        valX.toString(),
        clean_zeros(
          new Map(
            R.map((valY) => [
              valY,
              (pmfX.get(valX) ?? ZERO).mul(pmfY.get(valY) ?? ZERO),
            ])
          )
        ),
      ])
    )
  );

  const pmf: PMF = new Map();

  [...jointProbMap.entries()].forEach(([x, xPMF]) => {
    [...xPMF.entries()].forEach(([y, prob]) => {
      const k = add ? Number(x) + Number(y) : Number(x) - Number(y);
      pmf.set(k, (pmf.get(k) ?? ZERO).add(prob));
    });
  });

  return pmf;
};

export const make_pmf = (diceFace: number, advantage = 0, pos = true): PMF => {
  if (advantage === 0) {
    return new Map(
      [...Array(diceFace).keys()].map((i) => [i + 1, new Fraction(1, diceFace)])
    );
  }
  const A = Math.abs(advantage) + 1;
  const x = [...Array(diceFace).keys()]
    .map((v) => v + 1)
    .map(
      (v) =>
        [v, new Fraction(v ** A - (v - 1) ** A, diceFace ** A)] as [
          number,
          Fraction
        ]
    );

  const basePMF = new Map(
    [...x.map(([k, v]) => [advantage > 0 ? k : diceFace - k + 1, v])].sort(
      ([kl, _], [kr, __]) => (kl < kr ? -1 : 1)
    ) as [number, Fraction][]
  );
  if (pos === false) {
    return add_pmfs(zero_pmf(), basePMF, false);
  }
  return basePMF;
};

export const printPMF = (pmf: PMF) => {
  // eslint-disable-next-line no-console
  console.log(
    new Map(
      [...pmf.entries()]
        .sort(([kl, _vl], [kr, _vr]) => kl - kr)
        .map(([k, v]) => [k, new Fraction(v).valueOf().toFixed(6)])
    )
  );
  console.log(
    `SUM: ${[...pmf.values()].reduce((acc, n) => acc.add(n), ZERO).toString()}`
  );
};

export const cumSumHits = (pmf: PMF) => {
  let acc = ZERO;
  return new Map(
    [...pmf.entries()]
      .sort(([lk, lv], [rk, rv]) => lk - rk)
      // eslint-disable-next-line no-return-assign
      .map(([val, p]) => [val + 1, (acc = acc.add(p))])
  );
};

// export const convolve_pmfs_sum = (pmfX_: PMF, pmfY_: PMF, add: boolean) => {
//   const pmfX = new Map([...pmfX_.entries()].sort());
//   const pmfY = new Map([...pmfY_.entries()].sort());
//   const pmfXMax = Math.max(...pmfX.keys());
//   const pmfYMax = Math.max(...pmfY.keys());
//   const jointProb = [...Array(pmfXMax + 1).keys()].map((xDex) =>
//     [...Array(pmfYMax + 1).keys()].map((yDex) =>
//       (pmfX.get(xDex) || ZERO).mul(pmfY.get(yDex) || ZERO)
//     )
//   );

//   const diagSign = add ? 1 : -1;

//   const diagExtra = add ? 0 : pmfYMax - 1;
//   const bound = (x: number) => x;
//   return [...Array(pmfXMax + pmfYMax + 2 - 1).keys()].reduce(
//     (acc, diagDex) =>
//       acc.set(
//         bound(diagDex),
//         [...Array(pmfXMax + pmfYMax + 2).keys()]
//           .map(
//             (i) =>
//               (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? ZERO
//           )
//           .reduce((l, r) => l.add(r))
//       ),
//     new Map()
//   ) as PMF;
// };

export const convolve_pmfs_prod = (pmfX_: PMF, pmfY_: PMF) => {
  const pmfX = new Map([...pmfX_.entries()].sort());
  const pmfY = new Map([...pmfY_.entries()].sort());

  const pmf = new Map<number, Fraction>() as PMF;
  [...pmfX.entries()].forEach(([xKey, xVal]) =>
    [...pmfY.entries()].forEach(([yKey, yVal]) => {
      pmf.set(xKey * yKey, (pmf.get(xKey * yKey) || ZERO).add(xVal.mul(yVal)));
    })
  );
  return pmf;
};

export const one_or_other_pmfs = (
  pmfX: PMF,
  pmfY: PMF,
  pX: Fraction,
  pY: Fraction
) => {
  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
  [...keySet].forEach((k) =>
    pmf.set(k, (pmfX.get(k) || ZERO).mul(pX).add((pmfY.get(k) || ZERO).mul(pY)))
  );

  return pmf;
};

// const pmfMax = (pmfX_: PMF, pmfY_: PMF) => {
//   const pmfX = new Map([...pmfX_.entries()].sort());
//   const pmfY = new Map([...pmfY_.entries()].sort());

//   const getGT = (pmf: PMF, than: number): Fraction =>
//     [...pmf.values()]
//       .slice(0, [...pmf.keys()].indexOf(than))
//       .reduce((acc, n) => acc.add(n), ZERO);
//   const pmfResult = new Map<number, Fraction>() as PMF;
//   const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
//   keySet.forEach((key) => {
//     // console.log({ key });
//     // console.log(getGT(pmfX, key).mul(pmfX.get(key) || ONE).toString(3));
//     // console.log(getGT(pmfY, key).mul(pmfY.get(key) || ONE).toString(3));
//     const xkey_ykey = (pmfX.get(key) || ZERO).mul(pmfY.get(key) || ZERO);
//     pmfResult.set(
//       key,
//       getGT(pmfX, key)
//         .mul(pmfX.get(key) || ONE)
//         .add(getGT(pmfY, key).mul(pmfY.get(key) || ONE))
//         .add(xkey_ykey)
//     );
//   });
//   return pmfResult;
// };

// const pmfMin = (pmfX_: PMF, pmfY_: PMF) => {
//   const pmfX = new Map([...pmfX_.entries()].sort());
//   const pmfY = new Map([...pmfY_.entries()].sort());

//   const getGT = (pmf: PMF, than: number): Fraction =>
//     [...pmf.values()]
//       .slice([...pmf.keys()].indexOf(than) + 1)
//       .reduce((acc, n) => acc.add(n), ZERO);
//   // console.log(getGT(pmfX, 2).toString(3));
//   const pmfResult = new Map<number, Fraction>() as PMF;
//   const keySet = new Set<number>([...pmfX.keys(), ...pmfY.keys()]);
//   keySet.forEach((key) => {
//     // console.log({ key });
//     // console.log(getGT(pmfX, key).mul(pmfX.get(key) || ONE).toString(3));
//     // console.log(getGT(pmfY, key).mul(pmfY.get(key) || ONE).toString(3));
//     const xkey_ykey = (pmfX.get(key) || ZERO).mul(pmfY.get(key) || ZERO);
//     pmfResult.set(
//       key,
//       getGT(pmfX, key)
//         .mul(pmfX.get(key) || ONE)
//         .add(getGT(pmfY, key).mul(pmfY.get(key) || ONE))
//         .add(xkey_ykey)
//     );
//   });
//   return pmfResult;
// };

export const computeCritChance = ({
  advantage,
  critFaces,
}: {
  advantage: number;
  critFaces: number;
}): Fraction => {
  if (advantage === 0) {
    return new Fraction(critFaces, 20);

  } if (advantage > 0){
    return ONE.sub(new Fraction(20 - critFaces, 20).pow(1+advantage));
  }
    return new Fraction(
      critFaces,
      20
    ).pow(1+Math.abs(advantage));
  
};

export const d20ToCritrate = (
  dice: string,
  critThreshold: number
): Fraction => {
  const [countS, fullFace] = dice.split("d");
  const count = Number(countS);

  if (fullFace.endsWith("kh") || fullFace.endsWith("kl")) {
    switch (fullFace.slice(-2)) {
      case "kh":
        return ONE.sub(new Fraction(critThreshold - 1, 20).pow(count));
      case "kl":
        return new Fraction(
          new Fraction(21).sub(new Fraction(critThreshold)),
          20
        ).pow(count);
      default:
        break;
    }
  }
  return new Fraction(1, 20);
};

export const d20ToFailRate = (dice: string) => {
  // console.log({ dice });
  const [countS, fullFace] = dice.split("d");
  const count = Number(countS);

  if (fullFace.endsWith("kh") || fullFace.endsWith("kl")) {
    switch (fullFace.slice(-2)) {
      case "kl":
        return d20ToCritrate(`${dice.slice(0, -2)}kh`, 20);
      case "kh":
        return d20ToCritrate(`${dice.slice(0, -2)}kl`, 20);
      default:
        break;
    }
  }
  return new Fraction(1 / 20);
};

export const isSimpleProcessable = (damage: string) =>
  Boolean(/^([\dd+\-khl]|(mod))+$/.test(damage.replaceAll(/\s/g, "")));

export const computeDicePMFs = (dice: Dice): PMFDice => {
  let pmfs: PMF[];
  if (!dice.dice) {
    pmfs = [new Map([[Number(dice.count), ONE]])];
  } else if (dice.op === "kh" || dice.op === "kl") {
    const c = Number(dice.count);
    pmfs = [
      make_pmf(Number(dice.face), dice.op === "kh" ? c : -c, dice.positive),
    ];
  } else {
    pmfs = [...Array(Number(dice.count) || 1).keys()].map(() =>
      make_pmf(Number(dice.face), 0, dice.positive)
    );
  }

  console.log("making dice pmf");
  console.log(dice);
  console.log(pmfs);

  return {
    ...dice,
    pmf: pmfs.reduce((acc, n) => add_pmfs(acc, n, true), EMPTY_PMF),
  };
};

export const combineDice = (formula: Formula): PMFFormula => {
  console.log(`combining ${formula.dice.toString()}`);
  const pmf = formula.dice
    .map(computeDicePMFs)
    .flat()
    .map((x: PMFDice) => x)
    .reduce((acc, n) => add_pmfs(acc, n.pmf, true), EMPTY_PMF);
  return { ...formula, pmf };
};

export const weighted_mean_pmf = (pmf: PMF) =>
  [...pmf.entries()].reduce(
    (acc, [d, p]) => acc.add(new Fraction(d).mul(p)),
    ZERO
  );


export type JPM_PMF = {
  pmf: PMF,
  chance: Fraction,
  name?: string
}

export const jointProbPMFs = (jpm_pmfs: JPM_PMF[]) => {
  console.log("Combining damage PMFs");
  const data: [string, string, string][] = [
    ["Name", "Damage", "Chance"],
    ...jpm_pmfs.map(({pmf, chance, name}) => [name, weighted_mean_pmf(pmf).toString(), chance.toString()] as [string,string,string])

  ];

  console.log(table(data));

  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([...jpm_pmfs.map(jp => [...jp.pmf.keys()]).flat(2)]);
  console.log({keySet});

  [...keySet].forEach((k) =>
    pmf.set(
      k,
      jpm_pmfs.reduce((acc, n) => acc.add((n.pmf.get(k) || ZERO).mul(n.chance)), ZERO)
    )
  );
  console.log("REs");
  printPMF(pmf);
  return pmf;
};


export const one_or_three_pmfs = ({
  hitDamagePMF,
  missDamagePMF,
  critDamagePMF,
  hitChance,
  missChance,
  critChance,
}: {
  hitDamagePMF: PMF;
  missDamagePMF: PMF;
  critDamagePMF: PMF;
  hitChance: Fraction;
  missChance: Fraction;
  critChance: Fraction;
}) => {
  console.log("Combining damage PMFs");
  const data: [string, string, string][] = [
    ["Name", "Damage", "Chance"],
    ["Hit", weighted_mean_pmf(hitDamagePMF).toString(), hitChance.toString()],
    ["Miss", weighted_mean_pmf(missDamagePMF).toString(), missChance.toString()],
    ["Crit", weighted_mean_pmf(critDamagePMF).toString(), critChance.toString()]
  ];
  console.log(table(data));
  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([
    ...hitDamagePMF.keys(),
    ...missDamagePMF.keys(),
    ...critDamagePMF.keys(),
  ]);
  console.log({keySet});
  
  [...keySet].forEach((k) =>
    pmf.set(
      k,
      (hitDamagePMF.get(k) || ZERO)
        .mul(hitChance)
        .add((missDamagePMF.get(k) || ZERO).mul(missChance))
        .add((critDamagePMF.get(k) || ZERO).mul(critChance))
    )
  );
  printPMF(pmf);
  return pmf;
};
