export type PMF = Map<number, number>;

export const boundProb = (x: number) => {
  return Math.max(0.05, Math.min(0.95, x));
};

export const make_pmf = (diceFace: number) =>
  new Map([...Array(diceFace).keys()].map((i) => [i + 1, 1 / diceFace]));

export const convolve_pmfs = (pmfX: PMF, pmfY: PMF, add: boolean) => {
  const jointProb = [...pmfX.entries()].map(([k, x]) =>
    [...pmfY.entries()].map(([k, y]) => x.valueOf() * y.valueOf())
  );

  const diagSign = add ? 1 : -1;

  const xLowerBound = Math.min(...pmfX.keys());
  const yLowerBound = Math.min(...pmfY.keys());

  const diagExtra = add ? 0 : pmfY.size - 1;

  const bound = (x: number) =>
    x + (add ? xLowerBound + yLowerBound : xLowerBound - pmfY.size);

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
