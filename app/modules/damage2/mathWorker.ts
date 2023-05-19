import type { Dice, JPM_PMF, PMF } from "~/modules/damage2/math";
import { consola } from "consola";

import {
  ONE,
  ZERO,
  add_pmfs,
  combineDice,
  combine_hit_and_buffs,
  computeCritChance,
  computeDicePMFs,
  jointProbPMFs,
  numberRange,
  parseDiceStrings,
  zero_pmf
} from "~/modules/damage2/math";

import workerpool from "workerpool";
import { ACs, type AC, type DamagePMF, type DamagePMFByAC } from "./types";

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
  label: string;
};

export type DamagerFormulae = {
  damage: Dice[];
  attack: Dice[];
};


const normalizePMF = (pmf: PMF) =>
  Object.fromEntries(
    [...pmf.entries()]
      .filter(([, frac]) => !frac.equals(ZERO))
      .map(([num, frac]) => [num, frac.toFraction()])
  );

const normalizePMFMess = (pmf: PMF) =>
  Object.fromEntries(
    [...pmf.entries()]
      .filter(([, frac]) => !frac.equals(ZERO))
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





// eslint-disable-next-line import/prefer-default-export
export const computeDamageInfo = (
  damageInfo: DamageInfo
): { damagePMFByAC: DamagePMFByAC; damageInfo: DamageInfo } => {
  consola.log("cdi");
  consola.log(damageInfo);
  const attackRoll = combineDice(
    parseDiceStrings({ diceStrings: damageInfo.attack })
  );

  let op: "kh" | "kl" | undefined;

  if (damageInfo.advantage > 0) {
    op = "kh";
  } else if (damageInfo.advantage < 0) {
    op = "kl";
  }
  consola.log({ op });

  const attackRollBase = computeDicePMFs({
    positive: true,
    count: Math.abs(damageInfo.advantage),
    face: 20,
    op,
    dice: true,
  });

  const critChance = computeCritChance({
    advantage: damageInfo.advantage,
    critFaces: damageInfo.critFaceCount,
  });

  const critFailChance = computeCritChance({
    advantage: -(damageInfo.advantage),
    critFaces: damageInfo.critFailFaceCount,
  });



  const hitDamagePMF = combineDice(
    parseDiceStrings({ diceStrings: damageInfo.damage })
  ).pmf;

  const critDamagePMF = combineDice(
    parseDiceStrings({ diceStrings: damageInfo.damage, crit: "raw" })
  ).pmf;


  const firstHitDamagePMF = combineDice(
    parseDiceStrings({ diceStrings: [damageInfo.damageOnFirstHit] })
  ).pmf;

  const firstHitCritDamagePMF = combineDice(
    parseDiceStrings({ diceStrings: [damageInfo.damageOnFirstHit] , crit: "raw"})
  ).pmf;

  // const damageOnHit = combineDice(parseDiceStrings({diceStrings:[ damagerMetadata.damageOnHit]})).pmf;
  const missDamagePMF =
    combineDice(
      parseDiceStrings({ diceStrings: [damageInfo.damageOnMiss] })
    ).pmf || zero_pmf();



  const damagePMFByAC = new Map<number, DamagePMF>() as DamagePMFByAC;

  ACs.forEach((ac: AC) => {
    consola.debug(`====================`);
    consola.debug(`====== AC: ${ac} ======`);


    const hit_data_per_count = combine_hit_and_buffs({
      toHit: attackRollBase.pmf,
      buffs: attackRoll.pmf,
      ac,
      smallestCrit: 21 - damageInfo.critFaceCount,
      biggestCritFail: damageInfo.critFailFaceCount,
    });

    const chanceToHit = [...hit_data_per_count.keys()].reduce(
      (acc, n) => acc.add(hit_data_per_count.get(n)?.hit ?? ZERO),
      ZERO
    );

    const chanceToCrit = [...hit_data_per_count.keys()].reduce(
      (acc, n) => acc.add(hit_data_per_count.get(n)?.crit ?? ZERO),
      ZERO
    );
    const chanceToMiss = [...hit_data_per_count.keys()].reduce(
      (acc, n) => acc.add(hit_data_per_count.get(n)?.miss ?? ZERO),
      ZERO
    );

    const chanceToCritMiss = [...hit_data_per_count.keys()].reduce(
      (acc, n) => acc.add(hit_data_per_count.get(n)?.critMiss ?? ZERO),
      ZERO
    );

    // const chanceToHit = hit_data_per_count.get(ac)?.hit ?? ZERO;
    // const chanceToCrit = hit_data_per_count.get(ac)?.crit ?? ZERO;
    // const chanceToMiss = hit_data_per_count.get(ac)?.miss ?? ZERO;
    // const chanceToCritMiss = hit_data_per_count.get(ac)?.critMiss ?? ZERO;

    const pmfs: JPM_PMF[] = [
      { name: "Hit", pmf: hitDamagePMF, chance: chanceToHit },
      { name: "Miss", pmf: missDamagePMF, chance: chanceToMiss },
      { name: "Crit Miss", pmf: missDamagePMF, chance: chanceToCritMiss },
      { name: "Crit", pmf: critDamagePMF, chance: chanceToCrit },
    ];
  
    const singleHitPmfs: JPM_PMF[] = [
      { name: "Hit", pmf: firstHitDamagePMF, chance: ONE.sub(ONE.sub(chanceToHit).pow(damageInfo.attackCount)) },
      { name: "Miss", pmf: missDamagePMF, chance: chanceToMiss },
      { name: "Crit Miss", pmf: missDamagePMF, chance: chanceToCritMiss },
      { name: "Crit", pmf: firstHitCritDamagePMF, chance: chanceToCrit },
    ];
    
  

    const damage_pmf = numberRange(1, damageInfo.attackCount + 1).reduce(
      (acc) => {
        const damagePMF = add_pmfs(acc, jointProbPMFs(pmfs), true);
        return damagePMF;
      },
      zero_pmf()
    );


    const finalPMF = add_pmfs(damage_pmf, jointProbPMFs(singleHitPmfs), true);

    

    damagePMFByAC.set(ac, finalPMF);
  });
  consola.debug("messy normalized");
  consola.debug(normalizeDamagePMFByACMess(damagePMFByAC));

  consola.debug("Normalized Damage PMF By AC:");
  consola.debug(normalizeDamagePMFByAC(damagePMFByAC));
  return {
    damagePMFByAC,
     damageInfo,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
workerpool.worker({
  computeDamageInfo,
});
