export const make_pmf = (diceFace: number) =>
  [...Array(diceFace).keys()].map((_) => 1 / diceFace);

export const convolve_pmfs = (pmfX: number[], pmfY: number[]) => {
  const mtx = [...Array(pmfX.length).keys()].map((x) =>
    [...Array(pmfY.length).keys()].map((y) => pmfX[x] * pmfY[y])
  );
  return [...Array(mtx.length + mtx[0].length).keys()].map((diagDex) =>
    [...Array(mtx.length + mtx[0].length).keys()]
      .map((i) => (mtx[diagDex - i] ?? [])[i] ?? 0)
      .reduce((l, r) => l + r)
  );
  // return diag_sum(matrix);
};

// export const diag_sum = (mtx: number[][]) =>
//   [...Array(mtx.length + mtx[0].length).keys()].map((diagDex) =>
//     [...Array(mtx.length + mtx[0].length).keys()]
//       .map((i) => (mtx[diagDex - i] ?? [])[i] ?? 0)
//       .reduce((l, r) => l + r)
//   );
