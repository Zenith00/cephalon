import React, { useEffect, useState } from 'react';
import { Aside } from '@mantine/core';
import type { Target } from '@pages/Damage';
import { DiceRoller } from 'dice-roller-parser';
// import { useTooltipInPortal, Portal } from "@visx/tooltip";
import DamageGraphCharts from '@damage/DamageGraphs/DamageGraphCharts';
import type { Player } from '@damage/types';

const data1 = [
  { x: '2020-01-01', y: 50 },
  { x: '2020-01-02', y: 10 },
  { x: '2020-01-03', y: 20 },
];

const data2 = [
  { x: '2020-01-01', y: 30 },
  { x: '2020-01-02', y: 40 },
  { x: '2020-01-03', y: 80 },
];

const H = (mod: number, ac: number): number => 1 - Math.min(0.95, Math.max(0, (ac - mod) / 20));

const diceRoller = new DiceRoller();

interface diceNode {
  head: object;
  ops: object[];
  root: boolean;
  type: string;
  mods: object[];
  count: number;
  die: {
    type: 'number';
    value: number;
  };
}

// const target_ac = 16;
// const bonus_to_hit = 0;

function DamageGraphsAside({
  target,
  player,
  hidden,
}: {
  target: Target;
  player: Player;
  hidden: boolean;
}) {
  const [graphWidth, setGraphWidth] = useState('50%');

  // const [setModalProp, setSetModalProp] = useState();

  // const SubmitModal = React.useCallback(() => {
  //   setModalContext(DamageCharts);
  // }, []);

  // const toggleWidth = React.useCallback(() => {
  //   setWidth((w) => (w === "50%" ? "100%" : "50%"));
  // }, []);

  useEffect(() => {
    console.log(graphWidth);
  }, [graphWidth]);

  return (
    <Aside
      // width={{ md: "100vw", lg: graphWidth }}
      // width={ graphWidth }
      zIndex={101}
      // style={{ zIndex: 10, maxWidth: 1000 }}
      style={{ zIndex: 10, width: graphWidth }}
      // pr={"md"}
      // hidden={hidden}
      // hiddenBreakpoint="md"
      // height={"100%"}
    >
      <Aside.Section grow>
        <div style={{ paddingTop: 10, paddingLeft: 10 }}>
          <DamageGraphCharts
            target={target}
            player={player}
            hidden={hidden}
            graphWidth={graphWidth}
            setGraphWidth={setGraphWidth}
          />
          {/* <XYChart> */}
          {/*  /!*<AnimatedLineSeries dataKey={"0"} data={*!/ */}
          {/*  /!*  damageContext?.get(selectedPlayerContext)?.get(player.damagers[0].key)?.get("normal")?.get(target.ac)*!/ */}
          {/*  /!*} {...accessors} />*!/ */}
          {/* </XYChart> */}
        </div>
      </Aside.Section>
    </Aside>
  );
}

export default DamageGraphsAside;
