// import type { critType } from '@/damage/DamagerCard/DamagerCard';
// import { ACs } from "@/damage/constants";
// import type { AC } from "@/damage/types";
import { consola } from "consola";
import Fraction from "fraction.js";
import { table } from "table";
import type { DamagePMFByAC, AC } from "./types";
import type { DamageInfo } from "./mathWorker";
import { computeDamageInfo, normalizeDamagePMFByAC } from "./mathWorker";

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

export const numberRange = (start: number, end: number): number[] =>
  new Array(end - start).fill(undefined).map((d, i) => i + start);

export const cartesianProduct = <T,>(...allEntries: T[][]): T[][] =>
  allEntries.reduce<T[][]>(
    (results, entries) =>
      results
        .map((result) => entries.map((entry) => [...result, entry]))
        .reduce((subResults, result) => [...subResults, ...result], []),
    [[]]
  );
  export const ACs = numberRange(1,30+1) as AC[];
type damagerFormValue = {
  label: string;
  attack: string;
  attackCount: number;
  damage: string;
  key: string;
  advantage: string;
  damageOnFirstHit: string;
  damageOnMiss: string;
  critFailFaceCount: number;
  critFaceCount: number;
  gwmSS: boolean;
};

type globalValues = {
  damage: string;
  attack: string;
};

export type formValue = {
  global: globalValues;
  damagers: damagerFormValue[];
};

export type DamageMetadata = {
  damagePMFByAC: DamagePMFByAC;
  averageDamageByAC: Map<AC, number>;
  label: string;
};

// eslint-disable-next-line import/prefer-default-export
export const getEmptyDamager = (
  damagers: damagerFormValue[]
): damagerFormValue => ({
  label: "Example Attack",
  attack: "",
  damage: "1d6",
  damageOnFirstHit: "",
  damageOnMiss: "",
  attackCount: 1,
  key: (Math.max(...damagers.map((d) => Number(d.key)), -1) + 1).toString(),
  critFaceCount: 1,
  critFailFaceCount: 1,
  advantage: "0",
  gwmSS: false,
});

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

type HitData = {
  hit: Fraction;
  crit: Fraction;
  miss: Fraction;
  critMiss: Fraction;
};

export const combine_hit_and_buffs = ({
  toHit,
  buffs,
  ac,
  biggestCritFail = 1,
  smallestCrit = 20,
}: {
  toHit: PMF;
  buffs: PMF;
  ac: number;
  biggestCritFail?: number;
  smallestCrit?: number;
}) => {
  const pmf = new Map<number, HitData>();

  const absMin = Math.min(...toHit.keys(), ...buffs.keys());

  const absMax = Math.max(...toHit.keys()) + Math.max(...buffs.keys());

  const R = numberRange(absMin, absMax + 1);

  R.forEach((n) =>
    pmf.set(n, { hit: ZERO, crit: ZERO, miss: ZERO, critMiss: ZERO })
  );

  [...toHit.keys()].forEach((toHitX) => {
    [...buffs.keys()].forEach((buffY) => {
      const result = toHitX + buffY;
      const old = pmf.get(result)!;
      if (toHitX <= biggestCritFail) {
        old.critMiss = old?.critMiss.add(
          (toHit.get(toHitX) ?? ZERO).mul(buffs.get(buffY) ?? ZERO)
        );
      } else if (toHitX >= smallestCrit) {
        old.crit = old?.crit.add(
          (toHit.get(toHitX) ?? ZERO).mul(buffs.get(buffY) ?? ZERO)
        );
      } else if (result >= ac) {
        old.hit = old?.hit.add(
          (toHit.get(toHitX) ?? ZERO).mul(buffs.get(buffY) ?? ZERO)
        );
      } else {
        old.miss = old?.miss.add(
          (toHit.get(toHitX) ?? ZERO).mul(buffs.get(buffY) ?? ZERO)
        );
      }
    });
  });
  consola.debug("====");
  [...pmf.entries()].forEach(([n, data]) => {
    consola.debug(`\t[==${n}==]`);
    consola.debug(`\thit: ${data.hit.toString()}`);
    consola.debug(`\tmiss: ${data.miss.toString()}`);
    consola.debug(`\tcrit: ${data.crit.toString()}`);
    consola.debug(`\tcritMiss: ${data.critMiss.toString()}`);
  });
  consola.debug("====");

  return pmf;
};

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
  consola.log(
    new Map(
      [...pmf.entries()]
        .sort(([kl, _vl], [kr, _vr]) => kl - kr)
        .map(([k, v]) => [k, new Fraction(v).valueOf().toFixed(6)])
    )
  );
  consola.log(
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

export const computeCritChance = ({
  advantage,
  critFaces,
}: {
  advantage: number;
  critFaces: number;
}): Fraction => {
  if (advantage === 0) {
    return new Fraction(critFaces, 20);
  }
  if (advantage > 0) {
    return ONE.sub(new Fraction(20 - critFaces, 20).pow(1 + advantage));
  }
  return new Fraction(critFaces, 20).pow(1 + Math.abs(advantage));
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
  // consola.debug({ dice });
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

  consola.debug("making dice pmf");
  consola.debug(dice);
  consola.debug(pmfs);

  return {
    ...dice,
    pmf: pmfs.reduce((acc, n) => add_pmfs(acc, n, true), EMPTY_PMF),
  };
};

export const combineDice = (formula: Formula): PMFFormula => {
  consola.debug(`combining ${formula.dice.toString()}`);
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
  pmf: PMF;
  chance: Fraction;
  name?: string;
};
export const jointProbPMFs = (jpm_pmfs: JPM_PMF[]) => {
  consola.debug("Combining damage PMFs");
  const data: [string, string, string][] = [
    ["Name", "Damage", "Chance"],
    ...jpm_pmfs.map(
      ({ pmf, chance, name }) =>
        [name, weighted_mean_pmf(pmf).toString(), chance.toString()] as [
          string,
          string,
          string
        ]
    ),
  ];

  consola.debug("SUM:");
  consola.debug(jpm_pmfs.reduce((acc, n) => acc.add(n.chance), ZERO));
  consola.debug(table(data));

  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([
    ...jpm_pmfs.map((jp) => [...jp.pmf.keys()]).flat(2),
  ]);
  consola.debug({ keySet });

  [...keySet].forEach((k) =>
    pmf.set(
      k,
      jpm_pmfs.reduce(
        (acc, n) => acc.add((n.pmf.get(k) || ZERO).mul(n.chance)),
        ZERO
      )
    )
  );
  consola.debug("RESULT:");
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
  consola.debug("Combining damage PMFs");
  const data: [string, string, string][] = [
    ["Name", "Damage", "Chance"],
    ["Hit", weighted_mean_pmf(hitDamagePMF).toString(), hitChance.toString()],
    [
      "Miss",
      weighted_mean_pmf(missDamagePMF).toString(),
      missChance.toString(),
    ],
    [
      "Crit",
      weighted_mean_pmf(critDamagePMF).toString(),
      critChance.toString(),
    ],
  ];
  consola.debug(table(data));
  const pmf = new Map<number, Fraction>() as PMF;
  const keySet = new Set<number>([
    ...hitDamagePMF.keys(),
    ...missDamagePMF.keys(),
    ...critDamagePMF.keys(),
  ]);
  consola.debug({ keySet });

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

// const damageInfo: DamageInfo = {
//   damage: ["1d6"],
//   attack: [],
//   damageOnMiss: "",
//   damageOnFirstHit: "",
//   attackCount: 2,
//   critFaceCount: 1,
//   critFailFaceCount: 1,
//   advantage: 0,
//   key: ":R1cm:",
// };
// const { damagePMFByAC } = computeDamageInfo(damageInfo);

// const r = normalizeDamagePMFByAC(damagePMFByAC);

// console.log(r);
