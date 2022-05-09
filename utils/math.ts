import { critType } from "@/damage/DamagerCard/DamagerCard";

export type PMF = Map<number, number>;

export const boundProb = (x: number, critRate: number, failRate: number) => {
  return Math.max(critRate, Math.min(1 - failRate, x));
};

export const cumSum = (pmf: PMF) => {
  let acc = 0;
  return new Map(
    [...pmf.entries()].sort((x) => x[0]).map(([val, p]) => [val, (acc += p)])
  );
};

export const make_pmf = (diceFace: number, advantage = 0) => {
  if (advantage === 0) {
    return new Map(
      [...Array(diceFace).keys()].map((i) => [i + 1, 1 / diceFace])
    );
  } else {
    let A = Math.abs(advantage) + 1;
    let x = [...Array(diceFace).keys()]
      .map((x) => x + 1)
      .map((x) => [x, (x ** A - (x - 1) ** A) / diceFace ** A]);

    return new Map(
      [...x.map(([k, v]) => [advantage > 0 ? k : diceFace - k + 1, v])].sort(
        ([kl, vl], [kr, vr]) => (kl < kr ? -1 : 1)
      ) as [number, number][]
    );
  }
};

//
// export const pmf_min = (pmfX: PMF, pmfY: PMF) => {
//   const lowerBound = Math.min(...pmfX.keys(), ...pmfY.keys());
//   const upperBound = Math.max(...pmfX.keys(), ...pmfY.keys());
//
//   const width = upperBound - lowerBound + 1;
//   return [...Array(width).keys()]
//     .map((x) => x + lowerBound)
//     .map((n) => {
//       let l = [...Array(width - n).keys()]
//         .map((x) => x + n + 1)
//         .map((x) => (pmfX.get(n) || 0) * (pmfY.get(x) || 0));
//       // .reduce((acc, c) => acc + c, 0);
//       let r = [...Array(width - n).keys()]
//         .map((x) => x + n + 1)
//         .map((x) => (pmfX.get(x) || 0) * (pmfY.get(n) || 0));
//       // .reduce((acc, c) => acc + c, 0);
//       return [n, [...l, ...r]];
//     });
// };
//
// export const pmf_max = (pmfX: PMF, pmfY: PMF) => {
//   //
//   // const width = upperBound - lowerBound + 1;
//   // return [...Array(width).keys()]
//   //   .map((x) => x + lowerBound)
//   //   .map((n) => {
//   //     let l = [...Array(n).keys()]
//   //       .map((x) => x + 1)
//   //       .map((x) => (pmfX.get(x) || 0) * (pmfY.get(n) || 0));
//   //     // .reduce((acc, c) => acc + c, 0);
//   //     let r = [...Array(n).keys()]
//   //       .map((x) => x + 1)
//   //       .map((x) => (pmfX.get(n) || 0) * (pmfY.get(x) || 0));
//   //     // .reduce((acc, c) => acc + c, 0);
//   //     return [n, [...l, ...r], [...l, ...r].reduce((acc, c) => acc + c, 0)];
//   //   });
// };

export const convolve_pmfs_sum = (pmfX: PMF, pmfY: PMF, add: boolean) => {
  const jointProb = [...pmfX.entries()].map(([k, x]) =>
    [...pmfY.entries()].map(([k, y]) => x.valueOf() * y.valueOf())
  );

  const diagSign = add ? 1 : -1;

  const xLowerBound = Math.min(...pmfX.keys());
  const yLowerBound = add
    ? Math.min(...pmfY.keys())
    : -Math.max(...pmfY.keys());

  const diagExtra = add ? 0 : pmfY.size - 1;
  const bound = (x: number) => x + xLowerBound + yLowerBound;

  return [...Array(pmfX.size + pmfY.size - 1).keys()].reduce(
    (acc, diagDex) =>
      acc.set(
        bound(diagDex),
        [...Array(pmfX.size + pmfY.size).keys()]
          .map(
            (i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? 0
          )
          .reduce((l, r) => l + r)
      ),
    new Map()
  );
  // return diag_sum(matrix);
};
const pmfMax = (pmf1: PMF, pmf2: PMF) => {
  const pmfResult = new Map<number, number>() as PMF;
};
export const diceToPMF = (dice: string) => {
  let [count, face] = dice.split("d");

  if (face) {
    if (face.endsWith("kh") || face.endsWith("kl")) {
      let c = parseInt(count) - 1;

      return [
        make_pmf(parseInt(face.slice(0, -2)), face.endsWith("kh") ? c : -c),
      ];
    } else {
      return [...Array(parseInt(count) || 1).keys()].map((_) =>
        make_pmf(parseInt(face))
      );
    }
  } else {
    return [new Map([[parseInt(count), 1]])];
  }
};

export const d20ToCritrate = (dice: string, critThreshold: number) => {
  let [countS, fullFace] = dice.split("d");
  let count = parseInt(countS);

  if (fullFace.endsWith("kh") || fullFace.endsWith("kl")) {
    switch (fullFace.slice(-2)) {
      case "kh":
        return 1 - ((critThreshold - 1) / 20) ** count;
      case "kl":
        return ((21 - critThreshold) / 20) ** count;
    }
  }
  return 1 / 20;
};

export const d20ToFailRate = (dice: string) => {
  let [countS, fullFace] = dice.split("d");
  let count = parseInt(countS);

  if (fullFace.endsWith("kh") || fullFace.endsWith("kl")) {
    switch (fullFace.slice(-2)) {
      case "kl":
        return 1 - (19 / 20) ** count;
      case "kh":
        return (1 / 20) ** count;
    }
  }
  return 1 / 20;
};

export const isSimpleProcessable = (damage: string) =>
  Boolean(new RegExp(/^[\dd+\-khl]+$/).test(damage.replaceAll(/\s/g, "")));

export const simpleProcess = (
  damage: string,
  crit: critType = "none"
): PMF | void => {
  let state: "pos" | "neg" = "pos";
  let clean = damage.replaceAll(/\s/g, "");
  if (!new RegExp(/^[\dd+\-khl]+$/).test(clean)) {
    return;
  }

  let dice = {
    pos: [],
    neg: [],
  } as {
    pos: string[];
    neg: string[];
  };

  let dice_acc = "";

  [...clean].forEach((c) => {
    if (c === "-" || c === "+") {
      // if (dice_acc) {
      dice[state].push(dice_acc);
      dice_acc = "";
      // }
      state = c === "-" ? "neg" : "pos";
    } else {
      dice_acc += c;
    }
  });
  dice[state].push(dice_acc);

  if (crit === "normal") {
    dice = Object.fromEntries(
      [Object.entries(dice)].map(([[posneg, d]]) => [
        posneg,
        d.map((x) => {
          if (x.includes("d")) {
            let [count, face] = x.split("d");
            return `${parseInt(count) * 2}d${face}`;
          } else {
            return x;
          }
        }),
      ]) || []
    ) as {
      pos: string[];
      neg: string[];
    };
  }
  console.log(dice);

  let pmf = (dice.pos || [])
    .filter((x) => x)
    .map(diceToPMF)
    .flat()
    .map((x: PMF) => {
      return x;
    })
    .reduce((acc, c) => convolve_pmfs_sum(acc, c, true), new Map([[0, 1]]));

  pmf = (dice.neg || [])
    .filter((x) => x)
    .map(diceToPMF)
    .flat()
    .map((x: PMF) => x)
    .reduce((acc, c) => convolve_pmfs_sum(acc, c, false), pmf);

  return pmf;
};
