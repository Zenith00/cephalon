import type { AC } from "@/damage/types";
import {
  computeDamageInfo,
  normalizeDamagePMFByAC,
  type DamageInfo,
} from "@/damage2/mathWorker";
import { DamageMetadata } from "@pages/Damage2";
import type { PMF } from "@utils/math";
import { add_pmfs, zero_pmf, make_pmf } from "@utils/math";
import Fraction from "fraction.js";
import * as data from "./data";

const compare_pmf_with_value = (pmf: PMF, kv: { [k: string]: number }) => {
  pmf.forEach((v: Fraction, k: AC) => {
    expect(v.equals(new Fraction(kv[k.toString()])));
  });
};

test("-1d3", () => {
  const kv = { "-3": 1 / 3, "-2": 1 / 3, "-1": 1 / 3 };
  const pmf_negativenumber = add_pmfs(zero_pmf(), make_pmf(3), false);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("1d3", () => {
  const kv = { "3": 1 / 3, "2": 1 / 3, "1": 1 / 3 };
  const pmf_negativenumber = add_pmfs(zero_pmf(), make_pmf(3), true);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("2d3", () => {
  const kv = { "2": 1 / 9, "3": 2 / 9, "4": 3 / 9, "5": 2 / 9, "6": 1 / 9 };
  const pmf_negativenumber = add_pmfs(make_pmf(3), make_pmf(3), true);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("1d2+1d3", () => {
  const kv = { "2": 1 / 6, "3": 2 / 6, "4": 2 / 6, "5": 1 / 6 };
  const pmf_negativenumber = add_pmfs(make_pmf(2), make_pmf(3), true);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("1d3+1d2", () => {
  const kv = { "2": 1 / 6, "3": 2 / 6, "4": 2 / 6, "5": 1 / 6 };
  const pmf_negativenumber = add_pmfs(make_pmf(3), make_pmf(2), true);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("1d3-1d5", () => {
  const kv = {
    "-4": 1 / 15,
    "-3": 2 / 15,
    "-2": 3 / 15,
    "-1": 3 / 15,
    "0": 3 / 15,
    "1": 2 / 15,
    "2": 1 / 15,
  };
  const pmf_negativenumber = add_pmfs(make_pmf(3), make_pmf(5), false);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("1d5-1d3", () => {
  const kv = {
    "-2": 1 / 15,
    "-1": 2 / 15,
    "-0": 3 / 15,
    "1": 3 / 15,
    "2": 3 / 15,
    "3": 2 / 15,
    "4": 1 / 15,
  };
  const pmf_negativenumber = add_pmfs(make_pmf(5), make_pmf(3), false);
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("1d3+1d4+1d5", () => {
  const kv = {
    "3": 1 / 60,
    "4": 3 / 60,
    "5": 6 / 60,
    "6": 9 / 60,
    "7": 11 / 60,
    "8": 11 / 60,
    "9": 9 / 60,
    "10": 6 / 60,
    "11": 3 / 60,
    "12": 1 / 60,
  };
  const pmf_negativenumber = add_pmfs(
    add_pmfs(make_pmf(3), make_pmf(4), true),
    make_pmf(5),
    true
  );
  compare_pmf_with_value(pmf_negativenumber, kv);
});

test("compute damage info basic 2d6", () => {
  const damageInfo: DamageInfo = {
    damage: ["2d6"],
    attack: [],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 1,
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: 0,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_2d6);
});


test("compute damage info basic 1d6 crit 19", () => {
  const damageInfo: DamageInfo = {
    damage: ["1d6"],
    attack: [],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 1,
    critFaceCount: 2,
    critFailFaceCount: 1,
    advantage: 0,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_1d6_crit_on_19);
});


// test("compute damage info basic 2d6 crit 17", () => {
//   const damageInfo: DamageInfo = {
//     damage: ["2d6"],
//     attack: [],
//     damageOnMiss: "",
//     damageOnFirstHit: "",
//     attackCount: 1,
//     critFaceCount: 3,
//     critFailFaceCount: 1,
//     advantage: 0,
//     key: ":R1cm:",
//   };
//   const { damagePMFByAC } = computeDamageInfo(damageInfo);

//   expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_2d6_crit_on_17);
// });


test("compute damage info 1d6 two attacks", () => {
  const damageInfo: DamageInfo = {
    damage: ["1d6"],
    attack: [],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 2,
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: 0,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_1d6_two_attacks);
});

test("compute damage info 1d6 advantage", () => {
  const damageInfo: DamageInfo = {
    damage: ["1d6"],
    attack: [],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 1,
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: 1,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_1d6_advantage);
});

test("compute damage info 1d6 disadvantage", () => {
  const damageInfo: DamageInfo = {
    damage: ["1d6"],
    attack: [],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 1,
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: -1,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_1d6_disadvantage);
});
 

test("compute damage info 1d6 bless", () => {
  const damageInfo: DamageInfo = {
    damage: ["1d6"],
    attack: ["1d4"],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 1,
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: 0,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_1d6_bless);
});
 
test("compute damage info 1d6 bless advantage", () => {
  const damageInfo: DamageInfo = {
    damage: ["1d6"],
    attack: ["1d4"],
    damageOnMiss: "",
    damageOnFirstHit: "",
    attackCount: 1,
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: 1,
    key: ":R1cm:",
  };
  const { damagePMFByAC } = computeDamageInfo(damageInfo);

  expect(normalizeDamagePMFByAC(damagePMFByAC)).toEqual(data.data_1d6_bless_advantage);
});
 