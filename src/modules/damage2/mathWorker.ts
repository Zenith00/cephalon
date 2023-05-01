import { ACs } from "@/damage/constants";
import type { Dice, Formula, JPM_PMF, PMF } from "@utils/math";
import {
  ONE,
  ZERO,
  add_pmfs,
  boundHitChance,
  clean_zeros,
  combineDice,
  computeCritChance,
  computeDicePMFs,
  numberRange,
  one_or_three_pmfs as combineDamagePMFs,
  parseDiceStrings,
  printPMF,
  shiftPMF,
  weighted_mean_pmf,
  zero_pmf,
  jointProbPMFs,
} from "@utils/math";
import Fraction from "fraction.js";

import workerpool from "workerpool";
import type { DamagePMF, DamagePMFByAC } from "./types";

export type DamageInfo = {
  damage: string[];
  damageOnFirstHit: string;
  damageOnMiss: string;
  attack: string[];
  attackCount: number;
  critFaceCount: number;
  critFailFaceCount: number;
  advantage: number;
  key: string;
};

export type DamagerFormulae = {
  damage: Dice[];
  attack: Dice[];
};

type critType = "normal" | "none";

const normalizePMF = (pmf: PMF) =>
  Object.fromEntries(
    [...pmf.entries()]
      .filter(([num, frac]) => !frac.equals(ZERO))
      .map(([num, frac]) => [num, frac.toFraction()])
  );

const normalizePMFMess = (pmf: PMF) =>
  Object.fromEntries(
    [...pmf.entries()]
      .filter(([num, frac]) => !frac.equals(ZERO))
      .map(([num, frac]) => [num, frac.toString()])
  );

export const normalizeDamagePMFByAC = (damagePMFByAC: DamagePMFByAC) =>
  Object.fromEntries(
    [...damagePMFByAC.entries()].map(([ac, pmf]) => [ac, normalizePMF(pmf)])
  );
export const normalizeDamagePMFByACMess = (damagePMFByAC: DamagePMFByAC) =>
  Object.fromEntries(
    [...damagePMFByAC.entries()].map(([ac, pmf]) => [ac, normalizePMFMess(pmf)])
  );

const cumSumHits = (pmf: PMF): PMF => {
  let acc = new Fraction(0);
  const cumSum = new Map(
    [...pmf.entries()]
      .sort(([lk, lv], [rk, rv]) => lk - rk)
      // eslint-disable-next-line no-return-assign
      .map(([val, p]) => [val + 1, (acc = acc.add(p))])
  );
  const minKey = Math.min(...cumSum.keys());
  const maxKey = Math.max(...cumSum.keys());

  if (minKey > 1) {
    numberRange(1, minKey).forEach((e) => {
      cumSum.set(e, ZERO);
    });
  }
  if (maxKey < 30) {
    numberRange(maxKey, 30).forEach((e) => {
      cumSum.set(e, cumSum.get(maxKey)!);
    });
  }

  return cumSum;
};

const boundChance = (frac: Fraction) => {
  if (frac.compare(ZERO) < 0) {
    return ZERO;
  }
  if (frac.compare(ONE) > 0) {
    return ONE;
  }
  return frac;
};

const boundMissChance = (missChance: Fraction, critFailChance: Fraction) => {
  if (missChance.compare(critFailChance) < 0) {
    return critFailChance;
  }
  return missChance;
};

const pFrac = (f: any) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  console.log(
    `${Object.keys(f)[0]}: ${f[Object.keys(f)[0] as any].valueOf().toString()}`
  );
};

// const computeSimpleDamagePMF({
//   damagePMF,
//   damageOnMissPMF: missDamagePMF,
//   damageOnFirstHitPMF,
//   critDamageOnFirstHitPMF,
//   attackCount,
//   critDamagePMF,
//   rollUnderChance,
//   critChance,
//   critFailChance,
//   allCritFaceCount,
// })

function computeDamagePmf({
  hitDamagePMF,
  missDamagePMF,
  damageOnFirstHitPMF,
  critDamageOnFirstHitPMF,
  critDamagePMF,
  rollUnderChance,
  critChance,
  critFailChance,
  noCritsChance,
  damagerMetadata
  
}: {
  hitDamagePMF: PMF;
  missDamagePMF: PMF;
  damageOnFirstHitPMF: PMF;
  critDamageOnFirstHitPMF: PMF;
  critDamagePMF: PMF;
  rollUnderChance: Fraction;
  critChance: Fraction;
  critFailChance: Fraction;
  noCritsChance: Fraction;
  damagerMetadata: DamageInfo
}) {


  // const absAdvantage = Math.abs(advantage);

  // const singleHitHitChanceByACNonCrit = ONE.sub(singleRollUnderChance);

  // const singleRollOverChance = ONE.sub(singleRollUnderChance);


// TODO: do NOT do advantage calculations early.
// do single dice calculations and then do the math afterwards
// All miss ^2 - miss miss - crit miss crit miss = residual value
// we KNOW what total square is 
// (A+B)^2
// so we can then do (A+B)^2 - A^2 - B^2 = 2AB



  const nonCritFactor = ONE.sub(noCritsChance);
  const critSum = critFailChance.add(critChance);
  console.log({ allCritFaceCount: nonCritFactor });
  console.log({ nonCritFactor });
  console.log({ critSum });
  console.log({ rollUnderChance });
  const regularMissChance = nonCritFactor.mul(rollUnderChance);
  console.log({ regularMissChance });
  const hitChance = ONE.sub(critChance)
    .sub(critFailChance)
    .sub(regularMissChance);


  

  const missChance = regularMissChance.add(critFailChance);
  


  console.log("hitDamagePMF");
  printPMF(hitDamagePMF);
  console.log("missDamagePMF");
  printPMF(missDamagePMF);
  console.log("critDamagePMF");
  printPMF(critDamagePMF);

  const pmfs: JPM_PMF[] = [
    { name: "Hit", pmf: hitDamagePMF, chance: hitChance },
    { name: "Miss", pmf: missDamagePMF, chance: regularMissChance },
    { name: "Crit Miss", pmf: missDamagePMF, chance: critFailChance },
    { name: "Crit", pmf: critDamagePMF, chance: critChance },
  ];


  // let finalDamagePMF = zero_pmf();

  return numberRange(1, damagerMetadata.attackCount + 1).reduce((acc, n) => {
    const damagePMF = add_pmfs(acc, jointProbPMFs(pmfs), true);
    return damagePMF;
  }, zero_pmf());


  // numberRange(1, attackCount + 1).forEach((i) => {
  //   const thisIsFirstHitChance = ONE.sub(missChance.pow(i));
  //   finalDamagePMF = jointProbPMFs(pmfs);

  //   // const finalDamagePMF = combineDamagePMFs({
  //   //   hitDamagePMF,
  //   //   missDamagePMF,
  //   //   critDamagePMF,
  //   //   hitChance,
  //   //   missChance,
  //   //   critChance,
  //   // });

  // });

  // return finalDamagePMF;

}

// function computeFinalPMF2(
//   advType: AdvantageType,
//   ac: AC,
//   missChance: Fraction,
//   critRate: Fraction,
//   failRate: Fraction,
//   damageString: string
// ) {
//   const simpleDamagePMF = simpleProcess(damageString)!;
//   const simpleCritBonusPMF = simpleProcess(damageString, "raw")!;
//   // printPMF(simpleCritBonusPMF);

//   const regularHitChance = new Fraction(1).sub(missChance).sub(critRate);

//   const finalPMF = one_or_three_pmfs(
//     simpleDamagePMF,
//     simpleCritBonusPMF,
//     new Map([[0, new Fraction(1)]]),
//     regularHitChance,
//     critRate,
//     missChance
//   );
//   // printPMF(finalPMF);
//   // console.log(weighted_mean_pmf(finalPMF).toString(6));
//   return finalPMF;
// }


// eslint-disable-next-line import/prefer-default-export
export const computeDamageInfo = (
  damagerMetadata: DamageInfo
): { damagePMFByAC: DamagePMFByAC; damagerMetadata: DamageInfo } => {
  console.log("cdi");
  console.log(damagerMetadata);
  const attackRoll = combineDice(
    parseDiceStrings({ diceStrings: damagerMetadata.attack })
  );
  const allCritFaceCount =
    damagerMetadata.critFaceCount + damagerMetadata.critFailFaceCount;

  let op: "kh" | "kl" | undefined;

  if (damagerMetadata.advantage > 0) {
    op = "kh";
  } else if (damagerMetadata.advantage < 0) {
    op = "kl";
  }
  console.log({ op });


  const attackRollBase = computeDicePMFs({
    positive: true,
    count: Math.abs(damagerMetadata.advantage),
    face: 20 - allCritFaceCount,
    op,
    dice: true,
  });

  const singleDiceAttackRollBase = computeDicePMFs({
    positive: true,
    count: 1,
    face: 20 - allCritFaceCount,
    op: undefined,
    dice: true,
  });




  console.log("attack roll ");

  printPMF(attackRollBase.pmf);

  const critChance = computeCritChance({
    advantage: damagerMetadata.advantage,
    critFaces: damagerMetadata.critFaceCount,
  });



  console.log({ critChance });
  const critFailChance = computeCritChance({
    advantage: -damagerMetadata.advantage,
    critFaces: damagerMetadata.critFailFaceCount,
  });
  console.log({ critFailChance });

  const noCritsChance = computeCritChance({
    advantage: damagerMetadata.advantage,
    critFaces: damagerMetadata.critFailFaceCount + damagerMetadata.critFaceCount,
  });


  const finalAttackRoll = add_pmfs(
    shiftPMF(attackRollBase.pmf, damagerMetadata.critFaceCount),
    attackRoll.pmf,
    true
  );

  // const singleDiceFinalAttackRoll = add_pmfs(
  //   shiftPMF(singleDiceAttackRollBase.pmf, damagerMetadata.critFaceCount),
  //   attackRoll.pmf,
  //   true
  // );

  // numberRange(1, 20).forEach((n) => !finalAttackRoll.has(n) && finalAttackRoll.set(n, ZERO));
  // finalAttackRoll = clean_zeros(finalAttackRoll);

  console.log("final attack roll pmf...");
  printPMF(finalAttackRoll);

  const missChanceByACNonCrit = cumSumHits(finalAttackRoll);
  // const singleHitMissChanceByACNonCrit = cumSumHits(singleDiceFinalAttackRoll);

  console.log("missChanceByACNonCrit.");
  printPMF(missChanceByACNonCrit);

  const hitDamagePMF = combineDice(
    parseDiceStrings({ diceStrings: damagerMetadata.damage })
  ).pmf;

  const critDamagePMF = combineDice(
    parseDiceStrings({ diceStrings: damagerMetadata.damage, crit: "raw" })
  ).pmf;

  // const damageOnHit = combineDice(parseDiceStrings({diceStrings:[ damagerMetadata.damageOnHit]})).pmf;
  const missDamagePMF =
    combineDice(
      parseDiceStrings({ diceStrings: [damagerMetadata.damageOnMiss] })
    ).pmf || zero_pmf();

  const damageOnFirstHitPMF =
    combineDice(
      parseDiceStrings({ diceStrings: [damagerMetadata.damageOnFirstHit] })
    ).pmf || zero_pmf();

  const critDamageOnFirstHitPMF = combineDice(
    parseDiceStrings({
      diceStrings: [damagerMetadata.damageOnFirstHit],
      crit: "raw",
    })
  ).pmf;

  console.log({ damageOnFirstHitPMF });
  console.log(damagerMetadata.damageOnFirstHit);

  // console.log({damagePMF});
  // console.log({critDamagePMF});

  const damagePMFByAC = ACs.reduce((damageMap, ac) => {
    console.log(`======= COMPUTING AC ${ac} =======`);
    const rollUnderChance = missChanceByACNonCrit.get(ac) ?? ONE;
    console.log(`Roll under: ${rollUnderChance.toString()}`);
    // const singleRollUnderChance = singleHitMissChanceByACNonCrit.get(ac) ?? ONE;
    const finalDamagePMF = computeDamagePmf({
      hitDamagePMF,
      missDamagePMF,
      damageOnFirstHitPMF,
      critDamagePMF,
      rollUnderChance,
      critDamageOnFirstHitPMF,
      critChance,
      critFailChance,
      noCritsChance,
      damagerMetadata
    });

    damageMap.set(ac, finalDamagePMF);

    return damageMap;
  }, new Map<number, DamagePMF>()) as DamagePMFByAC;

  // [...damagePMFByAC.entries()].forEach(([ac, damagePMF_]) => {
  //   console.log(`AC: ${ac}: Damage: ${weighted_mean_pmf(damagePMF_).valueOf()}`);
  // });
  // console.log("damage pmf by ac");
  // console.log(Object.fromEntries([...damagePMFByAC.entries()].map(([ac, pmf]) => [ac, normalizePMF(pmf)])));
  // console.log({damagePMFByAC});
  // console.log({damagerMetadata});
  console.log("messy normalized");
  console.log(normalizeDamagePMFByACMess(damagePMFByAC));

  console.log("Normalized Damage PMF By AC:");
  console.log(normalizeDamagePMFByAC(damagePMFByAC));
  return {
    damagePMFByAC,
    damagerMetadata,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
workerpool.worker({
  computeDamageInfo,
});
