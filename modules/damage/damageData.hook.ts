import { DamageData } from "@pages/Damage";
import {
  AdvantageType,
  AdvantageTypes,
  Player,
} from "@/damage/DamagerCard/PlayerCard";
import { useEffect, useRef, useState } from "react";
import {
  boundProb,
  convolve_pmfs_sum,
  cumSum,
  d20ToCritrate,
  d20ToFailRate,
  PMF,
  simpleProcess,
} from "@utils/math";
import { ADVANTAGE_TO_DICE } from "./constants";
import { useDebouncedValue } from "@mantine/hooks";

export const dummyDamageData = new Map([
  [0, new Map([[0, new Map([["normal" as AdvantageType, new Map()]])]])],
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

  useEffect(() => {
    let x = new Map(
      Object.entries(debouncedPlayerList).map(([playerKey, player]) => {
        return [
          parseInt(playerKey),

          new Map(
            Object.entries(player.damagers).map(([damagerKey, damager]) => {
              let playerAttackBonusDiceString =
                player.attackBonus >= 0
                  ? `+${player.attackBonus}`
                  : `${player.attackBonus}`;
              let simpleDamagePMF = simpleProcess(damager.damage || "1");
              let simpleCritPMF = simpleProcess(
                damager.damage || "1",
                "normal"
              );

              let simpleAttackPMFs = new Map(
                [...Object.entries(ADVANTAGE_TO_DICE)].map(
                  ([advType, advDice]) => [
                    advType,
                    simpleProcess(
                      `${advDice} ${playerAttackBonusDiceString} ${damager.modifiers
                        .map((m) => (["+", "-"].includes(m[0]) ? m : `+${m}`))
                        .join(" ")}`
                    ),
                  ]
                )
              );

              if (
                simpleDamagePMF &&
                simpleAttackPMFs &&
                simpleCritPMF &&
                [...simpleAttackPMFs.values()].every((x) => x)
              ) {
                //region [[Simple Processing]]
                let simpleDamage = [...simpleDamagePMF.entries()].reduce(
                  (acc, [d, p]) => (acc += d * p),
                  0
                );
                let critDamage = [...simpleCritPMF.entries()].reduce(
                  (acc, [d, p]) => (acc += d * p),
                  0
                );

                let attackCumsum = new Map(
                  [...simpleAttackPMFs.entries()].map(([k, v]) => [
                    k,
                    cumSum(v as PMF),
                  ])
                );

                const critawareEV = (
                  advType: AdvantageType,
                  hitChance: number
                ) => {
                  let critRate = d20ToCritrate(
                    ADVANTAGE_TO_DICE[advType],
                    player.critThreshold
                  );
                  let failRate = d20ToFailRate(ADVANTAGE_TO_DICE[advType]);
                  return (
                    critRate * critDamage +
                    (boundProb(hitChance, critRate, failRate) - critRate) *
                      simpleDamage
                  );
                };

                return [
                  parseInt(damagerKey),
                  new Map(
                    AdvantageTypes.map((advType) => {
                      let seen = false;

                      return [
                        advType,
                        [...Array(30).keys()].reduce((damageMap, ac) => {
                          let d = attackCumsum.get(advType)!.get(ac);
                          if (d) {
                            seen = true;
                          }
                          damageMap.set(
                            ac + 1,
                            critawareEV(advType, 1 - (d || (seen ? 1 : 0))) *
                              damager.count
                          );
                          return damageMap;
                        }, new Map<number, number>()),
                      ];
                    })
                  ),
                ];
                //endregion
              } else {
                return [
                  parseInt(damagerKey),
                  new Map([["normal" as AdvantageType, new Map()]]),
                ];
              }
            })
          ),
        ];
      })
    );
    setDamageData(x);
  }, [debouncedPlayerList]);

  return damageData;
};
