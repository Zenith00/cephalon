import type { DamageData } from '@pages/Damage';

import { useContext, useEffect, useState } from 'react';
import type { PMF } from '@utils/math';
import {
  boundMissChance,
  convolve_pmfs_prod,
  convolve_pmfs_sum,
  cumSumHits,
  d20ToCritrate,
  d20ToFailRate,
  isSimpleProcessable,
  one_or_other_pmfs, one_or_three_pmfs, printPMF,
  simpleProcess,
  weighted_mean_pmf,
} from '@utils/math';
import { useDebouncedValue } from '@mantine/hooks';

import Fraction from 'fraction.js';
import type {
  AC, AdvantageType, DamageInfo, Damager, DamagerKey, Player,
} from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import memoize from 'lodash.memoize';
import { AdvancedModeContext } from '@damage/contexts';
import { ACs, ADVANTAGE_TO_DICE } from './constants';

export const dummyDamageData = new Map([
  [0, new Map([[0, new Map([['normal' as AdvantageType, new Map()]])]])],
]) as DamageData;
// export const dummyDamageDetails = new Map([
//   [0, new Map([[0, new Map([['normal' as AdvantageType, new Map()]])]])],
// ]) as DamageDetails;

function computeMissChance(
  attackCumsum: Map<string, Map<number, Fraction>>,
  advType:AdvantageType,
  ac: AC,
  critRate: Fraction,
  failRate: Fraction,
) {
  const missChance = boundMissChance(attackCumsum.get(advType)!.get(ac) || new Fraction(1), critRate, failRate);
  return missChance;
}

function computeFinalPMF(
  advType: AdvantageType,
  ac: AC,
  missChance: Fraction,
  critRate: Fraction,
  failRate: Fraction,
  damageString: string,
  count: number,
  // firstHitOnly = false,
) {
  const simpleDamagePMF = simpleProcess(damageString)!;
  const simpleCritBonusPMF = simpleProcess(damageString, 'normal')!;
  const hitChance = new Fraction(1).sub(missChance);
  const critFactor = missChance.equals(1) ? critRate : critRate.div(hitChance);
  const critBonusPMF = convolve_pmfs_prod(
    simpleCritBonusPMF,
    new Map([[0, new Fraction(1).sub(critFactor)], [1, critFactor]]),
  );

  const fullPMF = convolve_pmfs_sum(simpleDamagePMF, critBonusPMF, true);
  // if (firstHitOnly) {
  //   const allMissChance = missChance.pow(count);
  //   const anyHitChance = new Fraction(1).sub(allMissChance);
  //   return convolve_pmfs_prod(fullPMF, new Map([[0, allMissChance], [1, anyHitChance]]));
  // }
  const hitChanceAwareDamagePMF = convolve_pmfs_prod(fullPMF, new Map([[0, missChance], [1, hitChance]]));
  return [...Array(count - 1).keys()].reduce(
    (acc) => convolve_pmfs_sum(acc, hitChanceAwareDamagePMF, true),
    hitChanceAwareDamagePMF,
  );
}
function computeFinalPMF2(
  advType: AdvantageType,
  ac: AC,
  missChance: Fraction,
  critRate: Fraction,
  failRate: Fraction,
  damageString: string,
) {
  const simpleDamagePMF = simpleProcess(damageString)!;
  const simpleCritBonusPMF = simpleProcess(damageString, 'raw')!;
  printPMF(simpleCritBonusPMF);

  const regularHitChance = new Fraction(1).sub(missChance).sub(critRate);

  const finalPMF = one_or_three_pmfs(
    { hitDamagePMF: simpleDamagePMF, missDamagePMF: simpleCritBonusPMF, critDamagePMF: new Map([[0, new Fraction(1)]]), hitChance: regularHitChance, missChance: critRate, critChance: missChance },
  );
  printPMF(finalPMF);
  // console.log(weighted_mean_pmf(finalPMF).toString(6));
  return finalPMF;
}

const x = computeFinalPMF2(
  'normal',
  14,
  new Fraction(0.4),
  new Fraction(0.05),
  new Fraction(0.05),
  '1d12+5',
);
// printPMF(x);
// console.log(weighted_mean_pmf(x).toString(5));

function calculateBasicDamageInfo(player: Player, damager: Damager) {
  const damagerBonus = player.attackBonus >= 0
    ? `+${player.attackBonus}`
    : `${player.attackBonus}`;

  const damagerDamage = damager.damage.replace('mod', player.modifier?.toString() || '0');
  const simpleAttackPMFs = new Map(
    [...Object.entries(ADVANTAGE_TO_DICE)].map(
      ([advType, advDice]) => [
        advType,
        simpleProcess(
          `${advDice} ${damagerBonus} ${damager.modifiers
            .map((m) => (['+', '-'].includes(m[0]) ? m : `+${m}`))
            .join(' ')}`,
        ),
      ],
    ),
  ) as Map<AdvantageType, PMF>;
  const attackCumsum = new Map(
    [...simpleAttackPMFs.entries()].map(([k, v]) => [
      k,
      cumSumHits(v),
    ]),
  );

  return { damagerDamage, attackCumsum };
}

const computeDamageInfo = memoize(((player: Player, damager: Damager, advancedMode: boolean) : Map<AdvantageType, Map<AC, PMF>> => {
  const { damagerDamage, attackCumsum } = calculateBasicDamageInfo(player, damager);

  if (
    !isSimpleProcessable(damager.damage)
  ) {
    return new Map([['normal' as AdvantageType, new Map([[0, new Map() as PMF]])]]);
  }

  const usedAdvantageTypes = advancedMode ? [damager.flags.advanced.advantageMode] : AdvantageTypes;

  return new Map(
    usedAdvantageTypes.map((advType) => {
      const critRate = d20ToCritrate(
        ADVANTAGE_TO_DICE[advType],
        player.critThreshold,
      );
      const failRate = d20ToFailRate(
        ADVANTAGE_TO_DICE[advType],
      );
      // console.log('ADV!');
      // console.log(ADVANTAGE_TO_DICE[advType]);
      // console.log(failRate);
      // console.log(critRate);
      return [
        advType,
        ACs.reduce((damageMap, ac) => {
          if (damager.damagerType === 'onHit') {
            const onHitTriggeringAllMiss = Object.values(player.damagers).filter((d) => d.flags.triggersOnHit).map((thisDamager) => {
              const damagerAttackCumSum = calculateBasicDamageInfo(player, thisDamager).attackCumsum;
              const damagerAdvType = [...thisDamager.advantageShow.entries()].filter(([_, show]) => show)[0][0];
              return computeMissChance(damagerAttackCumSum, damagerAdvType, ac, critRate, failRate).pow(thisDamager.count);
            }).reduce((acc, n) => acc.mul(n), new Fraction(1));

            const firstHitPMF = computeFinalPMF(advType, ac, onHitTriggeringAllMiss, critRate, failRate, damagerDamage, 1);
            damageMap.set(ac, firstHitPMF);
          } else {
            const missChance = computeMissChance(attackCumsum, advType, ac, critRate, failRate);
            // console.log(`Miss chance with ac ${ac} ${advType} is ${missChance.toString(4)}`);

            let finalDamagePMF = computeFinalPMF(advType, ac, missChance, critRate, failRate, damagerDamage, damager.count);

            if (damager.flags.gwm || damager.flags.pam) {
            // const anyHitChance = new Fraction(1).sub(missChance.pow(damager.count))
              const noneCritsRate = (new Fraction(1).sub(critRate)).pow(damager.count);
              const anyCritsRate = new Fraction(1).sub(noneCritsRate);

              const PAMPMF = computeFinalPMF(advType, ac, missChance, critRate, failRate, `1d4+${player.modifier}`, 1);
              const GWMPMF = computeFinalPMF(advType, ac, missChance, critRate, failRate, damagerDamage, 1);

              const GWM_PAM_PMF = one_or_other_pmfs(PAMPMF, GWMPMF, noneCritsRate, anyCritsRate);
              if (!damager.flags.gwm) {
                finalDamagePMF = convolve_pmfs_sum(finalDamagePMF, PAMPMF, true);
              } else if (!damager.flags.pam) {
                finalDamagePMF = convolve_pmfs_sum(finalDamagePMF, convolve_pmfs_prod(GWMPMF, new Map([[0, noneCritsRate], [1, anyCritsRate]])), true);
              } else {
                finalDamagePMF = convolve_pmfs_sum(finalDamagePMF, GWM_PAM_PMF, true);
              }
            }

            damageMap.set(ac, finalDamagePMF);
          }

          return damageMap;
        }, new Map<number, PMF>()),
      ];
    }),
  );
  // endregion
}), (player: Player, damager: Damager) => (
  `${player.attackBonus}|${player.modifier}|${player.spellSaveDC}|${player.elvenAccuracy}|${player.battleMaster}|${player.critThreshold}|
  ${damager.damage}|${damager.modifiers.toString()}|${damager.atkBase}|${damager.count}|${damager.flags?.gwm}|${damager.flags?.pam}|${damager.damagerType}|${damager.key}
  |${damager.damagerType === 'onHit' ? Object.values(player.damagers).filter((d) => d.flags.triggersOnHit).reduce((acc, n) => acc + n.count, 0) : 0
  }`
));

export const useHandleDamageData = (playerList: { [key: number]: Player }) => {
  const [damageData, setDamageData] = useState<DamageData>(dummyDamageData);
  // const [damageDetails, setDamageDetails] = useState<DamageDetails>(dummyDamageDetails);
  const [debouncedPlayerList] = useDebouncedValue(playerList, 500);
  const advancedMode = useContext(AdvancedModeContext);

  // const workerAttack = useRef<Worker>();
  // const workerDamage = useRef<Worker>();

  function getACToDamageMap(attackOptions: Record<Damager['damagerType'], Map<AdvantageType, Map<AC, PMF>>>, advType: AdvantageType) {
    return new Map(ACs.map(
      (ac) => [ac, Object.fromEntries([...Object.entries(attackOptions)].map(([damageType, attackOption]) => [
        damageType as Damager['damagerType'], attackOption.get(advType)?.get(ac) || new Map([[0, new Fraction(1)]])]))],
    )
      .map(([ac, attackOption]) => {
        const damageEntries = Object.entries(attackOption).map(([damageType, pmf]) => [damageType as Damager['damagerType'], pmf as PMF, weighted_mean_pmf(pmf as PMF)] as [Damager['damagerType'], PMF, Fraction]).sort((l, r) => r[2].sub(l[2]).valueOf());
        return [ac, { bestType: damageEntries[0][0], pmf: damageEntries[0][1], mean: damageEntries[0][2] }];
      }));
  }

  useEffect(() => {
    const x = new Map(
      Object.entries(debouncedPlayerList).map(([playerKey, player]) => [
        Number(playerKey),
        new Map(
          Object.entries(player.damagers).map(
            ([damagerKey, damager]) => {
              const regular = computeDamageInfo(player, damager, advancedMode);

              const attackOptions = { } as Record<Damager['damagerType'], Map<AdvantageType, Map<AC, PMF>>>;
              if (damager.damagerType === 'powerAttack') {
                attackOptions.powerAttack = computeDamageInfo({
                  ...player,
                  attackBonus: player.attackBonus - 5,
                }, { ...damager, damage: `${damager.damage}+10` }, advancedMode);
              }
              if (!(damager.damagerType === 'powerAttack' && !damager.flags.powerAttackOptimalOnly)) {
                attackOptions.regular = regular;
              }

              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const combined = new Map([...regular.keys()].map((advType) => [
                advType,
                getACToDamageMap(attackOptions, advType),
              ])) as Map<AdvantageType, Map<AC, DamageInfo>>;

              return [Number(damagerKey) as DamagerKey, combined];
            },
          ),
        ),
      ]),
    );

    // const damageMeans = new Map(
    //   [...x.entries()].map(([playerKey, damagerMap]) => [
    //     (playerKey as PlayerKey),
    //     new Map([...damagerMap.entries()].map(([damagerKey, damagerData]) => [
    //       (damagerKey as DamagerKey),
    //       new Map([...damagerData.entries()].map(([advType, data]) => [
    //         advType,
    //         new Map([...data.entries()].map(([ac, pmf]) => [
    //           ac,
    //           weighted_mean_pmf(pmf).valueOf()]))]))]))]),
    // );
    // setDamageDetails(x);
    setDamageData(x);
  }, [debouncedPlayerList]);

  return { damageData };
};
