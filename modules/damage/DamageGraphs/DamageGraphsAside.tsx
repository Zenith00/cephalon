import React, { useContext, useEffect, useRef, useState } from "react";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  buildChartTheme,
  LineSeries,
  XYChart,
} from "@visx/xychart";
import {
  Aside,
  Title,
  Text,
  ThemeIcon,
  ColorSwatch,
  Button,
  ActionIcon,
} from "@mantine/core";
import {
  DamageDataContext,
  SelectedPlayerContext,
  SetModalContext,
  Target,
} from "@pages/Damage";
import { AdvantageTypes, Damager, Player } from "../DamagerCard/PlayerCard";
import { useDebouncedCallback } from "use-debounce";
import queryString from "query-string";
import styles from "./DamageGraphsCharts.module.css";
import {
  DiceRoll,
  DiceRoller,
  DiceRollResult,
  InlineExpression,
  MathExpression,
  MathFunctionExpression,
  ModGroupedRoll,
  NumberType,
  RollExpressionType,
  RollOrExpression,
  RootType,
} from "dice-roller-parser";
import { Line, LinePath } from "@visx/shape";
import { Scale, Legend } from "@visx/visx";
import { schemeSet2, schemeTableau10 } from "d3-scale-chromatic";
import { scaleOrdinal } from "@visx/scale";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { ScaleOrdinal } from "d3-scale";
import { lightTheme, Tooltip } from "@visx/xychart";
import debounce from "lodash.debounce";
import { convolve_pmfs_sum, make_pmf, PMF, boundProb } from "@utils/math";
import { AnyRoll } from "dice-roller-parser/dist/parsedRollTypes";
import { root } from "postcss";
// import { useTooltipInPortal, Portal } from "@visx/tooltip";
import { useViewportSize } from "@mantine/hooks";
import * as ColorConvert from "color-convert";
import { ArrowsMaximize } from "tabler-icons-react";
import DamageGraphCharts from "@damage/DamageGraphs/DamageGraphCharts";

const data1 = [
  { x: "2020-01-01", y: 50 },
  { x: "2020-01-02", y: 10 },
  { x: "2020-01-03", y: 20 },
];

const data2 = [
  { x: "2020-01-01", y: 30 },
  { x: "2020-01-02", y: 40 },
  { x: "2020-01-03", y: 80 },
];

const H = (mod: number, ac: number): number => {
  return 1 - Math.min(0.95, Math.max(0, (ac - mod) / 20));
};

const diceRoller = new DiceRoller();

interface diceNode {
  head: object;
  ops: object[];
  root: boolean;
  type: string;
  mods: object[];
  count: number;
  die: {
    type: "number";
    value: number;
  };
}

// const target_ac = 16;
// const bonus_to_hit = 0;

const DamageGraphsAside = ({
  target,
  player,
  hidden,
}: {
  target: Target;
  player: Player;
  hidden: boolean;
}) => {
  const [graphWidth, setGraphWidth] = useState("50%");
  // const [setModalProp, setSetModalProp] = useState();

  // const SubmitModal = React.useCallback(() => {
  //   setModalContext(DamageCharts);
  // }, []);

  // const toggleWidth = React.useCallback(() => {
  //   setWidth((w) => (w === "50%" ? "100%" : "50%"));
  // }, []);

  return (
    <Aside
      width={{ md: "100%", lg: graphWidth }}
      zIndex={101}
      // style={{ zIndex: 10, maxWidth: 1000 }}
      style={{ zIndex: 10 }}
      // pr={"md"}
      hidden={hidden}
      hiddenBreakpoint={"lg"}
    >
      <Aside.Section grow>
        <div style={{ paddingTop: 10 }}>
          <DamageGraphCharts
            target={target}
            player={player}
            hidden={hidden}
            graphWidth={graphWidth}
            setGraphWidth={setGraphWidth}
          />
          {/*<XYChart>*/}
          {/*  /!*<AnimatedLineSeries dataKey={"0"} data={*!/*/}
          {/*  /!*  damageContext?.get(selectedPlayerContext)?.get(player.damagers[0].key)?.get("normal")?.get(target.ac)*!/*/}
          {/*  /!*} {...accessors} />*!/*/}
          {/*</XYChart>*/}
        </div>
      </Aside.Section>
    </Aside>
  );
};

export default DamageGraphsAside;
