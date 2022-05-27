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
  simpleProcess,
  weighted_mean_pmf,
} from '@utils/math';
import { useDebouncedValue } from '@mantine/hooks';

import Fraction from 'fraction.js';
import type {
  AdvantageType, Damager, DamagerKey, Player,
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

const computeDamageInfo = memoize(((player: Player, damager: Damager, damagerKey: DamagerKey) : [ number, Map<AdvantageType, Map<number, PMF>>] => {
  const playerAttackBonusDiceString = player.attackBonus >= 0
    ? `+${player.attackBonus}`
    : `${player.attackBonus}`;
  const damageModEnriched = damager.damage.replace('mod', player.modifier?.toString() || '0');
  const simpleDamagePMF = simpleProcess(damageModEnriched);
  const simpleCritBonusPMF = simpleProcess(
    damageModEnriched,
    'normal',
  );

  const simpleAttackPMFs = new Map(
    [...Object.entries(ADVANTAGE_TO_DICE)].map(
      ([advType, advDice]) => [
        advType,
        simpleProcess(
          `${advDice} ${playerAttackBonusDiceString} ${damager.modifiers
            .map((m) => (['+', '-'].includes(m[0]) ? m : `+${m}`))
            .join(' ')}`,
        ),
      ],
    ),
  );

  if (
    !(simpleDamagePMF
      && simpleAttackPMFs
      && simpleCritBonusPMF
      && [...simpleAttackPMFs.values()].every((x) => x))
  ) {
    return [
      Number(damagerKey),
      new Map([['normal' as AdvantageType, new Map([[0, new Map() as PMF]])]]),
    ];
  }

  const attackCumsum = new Map(
    [...simpleAttackPMFs.entries()].map(([k, v]) => [
      k,
      cumSum(v as PMF),
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
        console.log(advType);
        return [
          advType,
          [...Array(30).keys()].reduce((damageMap, ac) => {
            const missChance = boundProb(attackCumsum.get(advType)!.get(ac) || new Fraction(1), critRate, failRate);
            const hitChance = new Fraction(1).sub(missChance);
            const critFactor = missChance.equals(1) ? critRate : critRate.div(hitChance);
            const critBonusPMF = convolve_pmfs_prod(
              simpleCritBonusPMF,
              new Map([[0, new Fraction(1).sub(critFactor)], [1, critFactor]]),
            );

            const fullPMF = convolve_pmfs_sum_2(simpleDamagePMF, critBonusPMF, true);
            const hitChanceAwareDamagePMF = convolve_pmfs_prod(fullPMF, new Map([[0, missChance], [1, hitChance]]));

            const finalDamagePMF = [...Array(damager.count - 1).keys()].reduce(
              (acc) => convolve_pmfs_sum_2(acc, hitChanceAwareDamagePMF, true),
              hitChanceAwareDamagePMF,
            );

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
  ${damager.damage}|${damager.modifiers.toString()}|${damager.atkBase}|${damager.count}|${damager.special?.gwm}|${damager.special?.pam}|${damagerKey}`
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
