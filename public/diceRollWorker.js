import { DiceRoller } from "dice-roller-parser";

const roller = new DiceRoller();
const SIMS = 1000;

let mean = (arr) => arr.reduce((a, b) => a + b) / arr.length;

addEventListener("message", (event) => {
  let { damage: dice } = event.data;

  const rolls = [...Array(SIMS).keys()]
    .map((x) => roller.rollValue(dice))
    .reduce((acc, curr) => acc.set(curr, (acc.get(curr) || 0) + 1), new Map());

  postMessage([
    event.data.index,
    new Map([...rolls.entries()].map(([k, v]) => [k, v / SIMS])),
  ]);
});
