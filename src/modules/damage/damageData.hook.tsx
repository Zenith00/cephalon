import type { DamageData, DamageDetails } from '@pages/Damage';

import { useEffect, useState } from 'react';
import type { PMF } from '@utils/math';
import {
  boundProb,
  convolve_pmfs_prod,
  convolve_pmfs_sum_2,
  cumSum,
  d20ToCritrate,
  d20ToFailRate,
  isSimpleProcessable,
  one_or_other_pmfs,
  simpleProcess,
  weighted_mean_pmf,
} from '@utils/math';
import { useDebouncedValue } from '@mantine/hooks';

import Fraction from 'fraction.js';
import type {
  AC, AdvantageType, Damager, DamagerKey, Player,
} from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import memoize from 'lodash.memoize';
import { ADVANTAGE_TO_DICE } from './constants';

export const dummyDamageData = new Map([
  [0, new Map([[0, new Map([['normal' as AdvantageType, new Map()]])]])],
]) as DamageData;
export const dummyDamageDetails = new Map([
  [0, new Map([[0, new Map([['normal' as AdvantageType, new Map()]])]])],
]) as DamageDetails;

function computeMissChance(
  attackCumsum: Map<string, Map<number, Fraction>>,
  advType:AdvantageType,
  ac: AC,
  critRate: Fraction,
  failRate: Fraction,
) {
  const missChance = boundProb(attackCumsum.get(advType)!.get(ac) || new Fraction(1), critRate, failRate);
  return missChance;
}

function computeFinalPMF(
  attackCumsum: Map<string, Map<number, Fraction>>,
  advType: AdvantageType,
  ac: AC,
  missChance: Fraction,
  critRate: Fraction,
  failRate: Fraction,
  damageString: string,
  // simpleCritBonusPMF: Map<number, Fraction>,
  // simpleDamagePMF: Map<number, Fraction>,
  count: number,
) {
  const simpleDamagePMF = simpleProcess(damageString)!;
  const simpleCritBonusPMF = simpleProcess(damageString, 'normal')!;
  const hitChance = new Fraction(1).sub(missChance);
  const critFactor = missChance.equals(1) ? critRate : critRate.div(hitChance);
  const critBonusPMF = convolve_pmfs_prod(
    simpleCritBonusPMF,
    new Map([[0, new Fraction(1).sub(critFactor)], [1, critFactor]]),
  );

  // printPMF(critBonusPMF);

  const fullPMF = convolve_pmfs_sum_2(simpleDamagePMF, critBonusPMF, true);
  const hitChanceAwareDamagePMF = convolve_pmfs_prod(fullPMF, new Map([[0, missChance], [1, hitChance]]));

  return [...Array(count - 1).keys()].reduce(
    (acc) => convolve_pmfs_sum_2(acc, hitChanceAwareDamagePMF, true),
    hitChanceAwareDamagePMF,
  );
}

const computeDamageInfo = memoize(((player: Player, damager: Damager, damagerKey: DamagerKey) : [ number, Map<AdvantageType, Map<number, PMF>>] => {
  if (damager.damagerType === 'powerAttack') {
    const damagePARaw = `${damager.damage}+10`;
    const atkBonusRaw = (player.attackBonus - 5) >= 0
      ? `+${player.attackBonus - 5}`
      : `${player.attackBonus - 5}`;
  }

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

  if (
    !isSimpleProcessable(damager.damage)
  ) {
    return [
      Number(damagerKey),
      new Map([['normal' as AdvantageType, new Map([[0, new Map() as PMF]])]]),
    ];
  }

  const attackCumsum = new Map(
    [...simpleAttackPMFs.entries()].map(([k, v]) => [
      k,
      cumSum(v),
    ]),
  );
  return [
    Number(damagerKey),
    new Map(
      AdvantageTypes.map((advType) => {
        const critRate = d20ToCritrate(
          ADVANTAGE_TO_DICE[advType],
          player.critThreshold,
        );
        const failRate = d20ToFailRate(
          ADVANTAGE_TO_DICE[advType],
        );
        return [
          advType,
          [...Array(30).keys()].reduce((damageMap, ac) => {
            const missChance = computeMissChance(attackCumsum, advType, ac, critRate, failRate);

            let finalDamagePMF = computeFinalPMF(attackCumsum, advType, ac, missChance, critRate, failRate, damagerDamage, damager.count);

            if (damager.flags.gwm || damager.flags.pam) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              // const anyHitChance = new Fraction(1).sub(missChance.pow(damager.count))
              const noneCritsRate = (new Fraction(1).sub(critRate)).pow(damager.count);
              const anyCritsRate = new Fraction(1).sub(noneCritsRate);

              const PAMPMF = computeFinalPMF(attackCumsum, advType, ac, missChance, critRate, failRate, `1d4+${player.modifier}`, 1);
              const GWMPMF = computeFinalPMF(attackCumsum, advType, ac, missChance, critRate, failRate, damagerDamage, 1);

              const GWM_PAM_PMF = one_or_other_pmfs(PAMPMF, GWMPMF, noneCritsRate, anyCritsRate);
              if (!damager.flags.gwm) {
                finalDamagePMF = convolve_pmfs_sum_2(finalDamagePMF, PAMPMF, true);
              } else if (!damager.flags.pam) {
                finalDamagePMF = convolve_pmfs_sum_2(finalDamagePMF, convolve_pmfs_prod(GWMPMF, new Map([[0, noneCritsRate], [1, anyCritsRate]])), true);
              } else {
                finalDamagePMF = convolve_pmfs_sum_2(finalDamagePMF, GWM_PAM_PMF, true);
              }
            }

            damageMap.set(ac + 1, finalDamagePMF);

            return damageMap;
          }, new Map<number, PMF>()),
        ];
      }),
    ),
  ];
  // endregion
}), (player: Player, damager: Damager, damagerKey: DamagerKey) => (
  `${player.attackBonus}|${player.modifier}|${player.spellSaveDC}|${player.elvenAccuracy}|${player.battleMaster}|${player.critThreshold}
  ${damager.damage}|${damager.modifiers.toString()}|${damager.atkBase}|${damager.count}|${damager.flags?.gwm}|${damager.flags?.pam}|${damagerKey}`
));

export const useHandleDamageData = (playerList: { [key: number]: Player }) => {
  const [damageData, setDamageData] = useState<DamageData>(dummyDamageData);
  const [damageDetails, setDamageDetails] = useState<DamageDetails>(dummyDamageDetails);
  const [debouncedPlayerList] = useDebouncedValue(playerList, 500);

  // const workerAttack = useRef<Worker>();
  // const workerDamage = useRef<Worker>();

  useEffect(() => {
    const x = new Map(
      Object.entries(debouncedPlayerList).map(([playerKey, player]) => [
        Number(playerKey),
        new Map(
          Object.entries(player.damagers).map(
            ([damagerKey, damager]) => computeDamageInfo(player, damager, Number(damagerKey)),
          ),
        ),
      ]),
    );

    const damageMeans = new Map(
      [...x.entries()].map(([playerKey, damagerMap]) => [
        playerKey,
        new Map([...damagerMap.entries()].map(([damagerKey, damagerData]) => [
          damagerKey,
          new Map([...damagerData.entries()].map(([advType, data]) => [
            advType,
            new Map([...data.entries()].map(([ac, pmf]) => [
              ac,
              weighted_mean_pmf(pmf).valueOf()]))]))]))]),
    );
    setDamageDetails(x);
    setDamageData(damageMeans);
  }, [debouncedPlayerList]);

  return { damageData, damageDetails };
};
