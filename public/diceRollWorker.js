import { DiceRoller } from 'dice-roller-parser';

const roller = new DiceRoller();
const SIMS = 1000;

// const mean = (arr) => arr.reduce((a, b) => a + b) / arr.length;

window.addEventListener('message', (event) => {
  const { damage: dice } = event.data;

  const rolls = [...Array(SIMS).keys()]
    .map(() => roller.rollValue(dice))
    .reduce((acc, curr) => acc.set(curr, (acc.get(curr) || 0) + 1), new Map());

  postMessage([
    event.data.index,
    new Map([...rolls.entries()].map(([k, v]) => [k, v / SIMS])),
  ]);
});
