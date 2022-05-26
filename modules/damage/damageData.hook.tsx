import { DamageData } from '@pages/Damage';

import { useEffect, useRef, useState } from 'react';
import {
  add_pmfs,
  boundProb, convolve_pmfs_prod,
  convolve_pmfs_sum,
  cumSum,
  d20ToCritrate,
  d20ToFailRate, multiply_pmf,
  PMF,
  simpleProcess, weighted_mean_pmf,
} from '@utils/math';
import { useDebouncedValue } from '@mantine/hooks';
import {
  AdvantageType,
  AdvantageTypes,
  Player,
} from '@/damage/DamagerCard/PlayerCard';

import { ADVANTAGE_TO_DICE } from './constants';

export const dummyDamageData = new Map([
  [0, new Map([[0, new Map([['normal' as AdvantageType, new Map()]])]])],
]);

// useEffect(() => {
//   let r = workersRef.current;
//
//   //
//   let damageMeanCalcs = {} as { [key: keyof Player["damagers"]]: number };
//   let messagesReceived = 0;
//   [...Array(NUM_WORKERS).keys()].map((i) => {
//     r[i] = new Worker(new URL("/public/diceRollWorker.js", import.meta.url));
//     r[i].onmessage = (event) => {
//       //
//       //   `Setting x:${i} y: ${event.data[1]} ${H(player.attackBonus, i)} ${i}`
//       // );
//       damageMeanCalcs[event.data[0]] = event.data[1];
//       if (++messagesReceived == workerPlayerCount) {
//         messagesReceived = 0;
//       }
//       //
//     };
//   });
//
//   return () => {
//     if (r) {
//       r.map((w) => w.terminate());
//     }
//   };
// }, []);

export const useHandleDamageData = (playerList: { [key: number]: Player }) => {
  const [damageData, setDamageData] = useState<DamageData>(dummyDamageData);
  const [debouncedPlayerList] = useDebouncedValue(playerList, 500);

  const workerAttack = useRef<Worker>();
  const workerDamage = useRef<Worker>();

  useEffect(() => {
    const x = new Map(
      Object.entries(debouncedPlayerList).map(([playerKey, player]) => [
        Number(playerKey),

        new Map(
          Object.entries(player.damagers).map(([damagerKey, damager]) => {
            const playerAttackBonusDiceString = player.attackBonus >= 0
              ? `+${player.attackBonus}`
              : `${player.attackBonus}`;
            const damageModEnriched = damager.damage.replace('mod', player.modifier?.toString() || '0');
            const simpleDamagePMF = simpleProcess(damageModEnriched);
            const simpleCritPMF = simpleProcess(
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

            // console.log(simpleAttackPMFs.get('normal'));

            if (
              simpleDamagePMF
                && simpleAttackPMFs
                && simpleCritPMF
                && [...simpleAttackPMFs.values()].every((x) => x)
            ) {
              // region [[Simple Processing]]
              const simpleDamage = weighted_mean_pmf(simpleDamagePMF);
              const critDamage = weighted_mean_pmf(simpleCritPMF);

              const attackCumsum = new Map(
                [...simpleAttackPMFs.entries()].map(([k, v]) => [
                  k,
                  cumSum(v as PMF),
                ]),
              );

              const critAwareDamagePMFs = new Map(AdvantageTypes.map((advType) => {
                const critrate = d20ToCritrate(
                  ADVANTAGE_TO_DICE[advType],
                  player.critThreshold,
                );
                return [
                  advType,
                  convolve_pmfs_sum(multiply_pmf(simpleDamagePMF, 1 - critrate), multiply_pmf(simpleCritPMF, critrate), true),
                  // new Map([...simpleCritPMF.entries()].map(([k, v]) => [k, v * ]))]));
                ];
              }));

              const critawareEV = (
                advType: AdvantageType,
                hitChance: number,
              ) => {
                const critRate = d20ToCritrate(
                  ADVANTAGE_TO_DICE[advType],
                  player.critThreshold,
                );
                const failRate = d20ToFailRate(ADVANTAGE_TO_DICE[advType]);
                return (
                  critRate * critDamage
                    + (boundProb(hitChance, critRate, failRate) - critRate)
                      * simpleDamage
                );
              };

              // console.log(attackCumsum);
              console.log(critAwareDamagePMFs);

              return [
                Number(damagerKey),
                new Map(
                  AdvantageTypes.map((advType) => {
                    // const critEnrichedDamagePMF = add_pmfs(simpleDamagePMF, critRateWeightedCritRatePMF.get(advType)!);
                    // console.log();
                    let seen = false;
                    const critRate = d20ToCritrate(
                      ADVANTAGE_TO_DICE[advType],
                      player.critThreshold,
                    );
                    return [
                      advType,
                      [...Array(30).keys()].reduce((damageMap, ac) => {
                        const missChance = attackCumsum.get(advType)!.get(ac)!;
                        if (missChance) {
                          seen = true;
                        }
                        const critrate = d20ToCritrate(
                          ADVANTAGE_TO_DICE[advType],
                          player.critThreshold,
                        );
                        const failRate = d20ToFailRate(ADVANTAGE_TO_DICE[advType]);

                        const critFailRate = critRate + failRate;

                        const nonCritFailPMF = multiply_pmf(simpleDamagePMF, 1 - critFailRate);
                        nonCritFailPMF.set(0, failRate);
                        const critPMF = multiply_pmf(simpleCritPMF, critRate);
                        const enhanced = add_pmfs(nonCritFailPMF, critPMF);

                        const hitChanceAwareDamagePMF = convolve_pmfs_prod(simpleDamagePMF, new Map([[0, missChance], [1, 1 - missChance]]));

                        // const critEnrichedHitChanceAwareDamagePMF =

                        const enhancedWithToHit = convolve_pmfs_prod(enhanced, new Map([[0, missChance], [1, 1 - missChance]]));
                        const enhancedWithToHit2 = multiply_pmf(enhanced, 1 - missChance);
                        enhancedWithToHit2.set(0, missChance);
                        // enhancedWithToHit.set(0, missChance);
                        // const expectedDamagePMF = multiply_pmf(simpleDamagePMF, 1 - (missChance || 0));
                        // const expectedCritPMF = multiply_pmf(simpleCritPMF, 1 - (missChance || 0));
                        // expectedDamagePMF.set(0, (missChance || 0));
                        // expectedCritPMF.set(0, (missChance || 0));
                        //
                        // const dummyCrit = multiply_pmf(simpleDamagePMF, (boundProb(1, critRate, failRate) - critRate));
                        // dummyCrit.set(0, 1 - (boundProb(1, critRate, failRate) - critRate));
                        // // const critFailAwareSimpleDamagePMF = multiply_pmf(simpleDamagePMF, 0.95);
                        //
                        // // const y = add_pmfs(multiply_pmf(critFailAwareSimpleDamagePMF, 1 - critrate), multiply_pmf(simpleCritPMF, critrate), true);
                        // const realDamagePMF = convolve_pmfs_sum(simpleDamagePMF, dummyCrit, true);

                        // realDamagePMF.set(0, failRate);

                        if (ac + 1 === 14) {
                          console.log(advType);
                          console.log(missChance);
                          console.log(hitChanceAwareDamagePMF);
                          // console.log(enhanced);
                          // console.log(enhancedWithToHit);
                          // console.log(enhancedWithToHit2);
                          console.log(weighted_mean_pmf(enhancedWithToHit));
                        }

                        damageMap.set(
                          ac + 1,
                          critawareEV(advType, 1 - (missChance || (seen ? 1 : 0)))
                              * damager.count,
                        );
                        return damageMap;
                      }, new Map<number, number>()),
                    ];
                    // console.log(retval);
                    // return retval;
                  }),
                ),
              ];
              // endregion
            }
            return [
              Number(damagerKey),
              new Map([['normal' as AdvantageType, new Map()]]),
            ];
          }),
        ),
      ]),
    );
    setDamageData(x);
  }, [debouncedPlayerList]);

  return damageData;
};
