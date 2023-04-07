import Fraction from "fraction.js";
import type { AC, AdvantageType, Damager, Player } from "@damage/types";
import { ACs, ADVANTAGE_TO_DICE } from "@damage/constants";
import {
  boundProb,
  convolve_pmfs_sum_2,
  d20ToCritrate,
  d20ToFailRate,
  one_or_three_pmfs,
  printPMF,
  simpleProcess,
  weighted_mean_pmf,
} from "@utils/math";

import workerpool from "workerpool";
import type {
  BlockPlayer,
  DamagePMF,
  DamagePMFByAC,
  HitPMF,
} from "@damageBlocks/types";

type critType = "normal" | "none";
type PMF = Map<number, Fraction>;

const cumSumHits = (pmf: PMF) => {
  let acc = new Fraction(0);
  return new Map(
    // eslint-disable-next-line no-return-assign
    [...pmf.entries()]
      .sort(([lk, lv], [rk, rv]) => lk - rk)
      .map(([val, p]) => [val + 1, (acc = acc.add(p))])
  );
};

function computeMissChance(
  toHitCumulative: PMF,
  advType: AdvantageType,
  ac: AC,
  critRate: Fraction,
  failRate: Fraction
) {
  return boundProb(
    toHitCumulative.get(ac) || new Fraction(1),
    critRate,
    failRate
  );
}

function computeFinalPMF2(
  advType: AdvantageType,
  ac: AC,
  missChance: Fraction,
  critRate: Fraction,
  failRate: Fraction,
  damageString: string
) {
  const simpleDamagePMF = simpleProcess(damageString)!;
  const simpleCritBonusPMF = simpleProcess(damageString, "raw")!;
  // printPMF(simpleCritBonusPMF);

  const regularHitChance = new Fraction(1).sub(missChance).sub(critRate);

  const finalPMF = one_or_three_pmfs(
    simpleDamagePMF,
    simpleCritBonusPMF,
    new Map([[0, new Fraction(1)]]),
    regularHitChance,
    critRate,
    missChance
  );
  // printPMF(finalPMF);
  // console.log(weighted_mean_pmf(finalPMF).toString(6));
  return finalPMF;
}

function computeToHitCumulative(
  damager: Damager,
  advType: AdvantageType,
  player?: Player | BlockPlayer
) {
  let playerAttackBonus: string | number;
  if (player) {
    playerAttackBonus =
      player?.attackBonus >= 0
        ? `+${player.attackBonus}`
        : `${player.attackBonus}`;
  } else {
    playerAttackBonus = 0;
  }
  // const damagerDamage = damager.damage.replace('mod', player.modifier?.toString() || '0');
  const simpleAttackPMFs = simpleProcess(
    `${ADVANTAGE_TO_DICE[advType]} ${playerAttackBonus} ${damager.modifiers
      .map((m) => (["+", "-"].includes(m[0]) ? m : `+${m}`))
      .join(" ")}`
  );
  return cumSumHits(simpleAttackPMFs);
}

export const computeDamageInfo = (
  damager: Damager,
  advType: AdvantageType,
  player?: BlockPlayer,
  toHitCumulativesOverride?: HitPMF[]
): { toHitCumulatives: HitPMF[]; damagePMFByAC: DamagePMFByAC } => {
  console.log("COMPUTING!!");
  const toHitCumulatives =
    toHitCumulativesOverride && toHitCumulativesOverride?.length
      ? toHitCumulativesOverride
      : [computeToHitCumulative(damager, advType, player)];
  console.log("WW");
  console.log(toHitCumulatives);
  const critRate = d20ToCritrate(
    ADVANTAGE_TO_DICE[advType],
    player?.critThreshold || 20
  );
  const failRate = d20ToFailRate(ADVANTAGE_TO_DICE[advType]);

  const damagePMFByAC = ACs.reduce((damageMap, ac) => {
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

    const missChance = toHitCumulatives.reduce(
      (acc, n) =>
        acc.mul(computeMissChance(n, advType, ac, critRate, failRate)),
      new Fraction(1)
    );
    const singleHitFinalDamagePMF = computeFinalPMF2(
      advType,
      ac,
      missChance,
      critRate,
      failRate,
      damager.damage
    );
    const finalDamagePMF = [...new Array(damager.count).keys()].reduce(
      (acc, n) => convolve_pmfs_sum_2(singleHitFinalDamagePMF, acc, true),
      new Map([[0, new Fraction(1)]])
    );

    damageMap.set(ac, finalDamagePMF);

    return damageMap;
  }, new Map<number, DamagePMF>()) as DamagePMFByAC;

  console.log("Returning damagePMFByAC");
  console.log({ damagePMFByAC });
  return {
    toHitCumulatives,
    damagePMFByAC,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
workerpool.worker({
  computeDamageInfo,
  computeToHitCumulative,
});
