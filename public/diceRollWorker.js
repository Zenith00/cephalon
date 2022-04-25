import { DiceRoller } from "dice-roller-parser";

const roller = new DiceRoller();
const SIMS = 1000;

let mean = (arr) => arr.reduce((a, b) => a + b) / arr.length;

let variance = (array, m) => {
  // let m = mean(array);
  return mean(arr.map((num) => Math.pow(num - m, 2)));
};

addEventListener("message", (event) => {
  const rolls = Array.from({ length: SIMS }, (x, i) => i + 1).map(() =>
    roller.rollValue(event.data.damage)
  );

  const m = mean(rolls);
  postMessage([event.data.index, m(rolls), variance(m)]);
});
