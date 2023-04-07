import React, { useContext, useEffect, useRef, useState } from "react";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  buildChartTheme,
  LineSeries,
  XYChart,
} from "@visx/xychart";
import { Aside, Title, Text, ThemeIcon, ColorSwatch } from "@mantine/core";
import {
  DamageDataContext,
  SelectedPlayerContext,
  Target,
} from "@pages/Damage";
import { AdvantageTypes, Damager, Player } from "./DamagerCard/PlayerCard";
import { useDebouncedCallback } from "use-debounce";
import queryString from "query-string";
import styles from "./DamageGraphs.module.css";
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
import { schemeSet2 } from "d3-scale-chromatic";
import { scaleOrdinal } from "@visx/scale";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { ScaleOrdinal } from "d3-scale";
import { lightTheme, Tooltip } from "@visx/xychart";
import debounce from "lodash.debounce";
import { convolve_pmfs_sum, make_pmf, PMF, boundProb } from "../../utils/math";
import { AnyRoll } from "dice-roller-parser/dist/parsedRollTypes";
import { root } from "postcss";
// import { useTooltipInPortal, Portal } from "@visx/tooltip";
import { useViewportSize } from "@mantine/hooks";

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

const accessors = {
  xAccessor: (d: any) => d.x,
  yAccessor: (d: any) => d.y,
};

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
const s = (l: number[]) => l.reduce((a, b) => a + b, 0);
const MAX_AC = 30;
const NUM_WORKERS = 8;
const DamageGraphs = ({
  target,
  player,
  hidden,
}: {
  target: Target;
  player: Player;
  hidden: boolean;
}) => {
  const [dataSets, setDataSets] = useState<{
    [key: keyof Player["damagers"]]: { x: number; y: number }[];
  }>([]);
  const { height, width } = useViewportSize();

  // const [damageMeans, setDamageMeans] = useState<{
  //   [key: keyof Player["damagers"]]: number;
  // }>({});
  const damageContext = useContext(DamageDataContext)!;
  const selectedPlayerContext = useContext(SelectedPlayerContext)!;

  // scaleOrdinal({
  //   domain: ["a"],
  //   range: ["blue"],
  // }) as any as ScaleOrdinal<any, any, never>
  // const [setMaxDamage, setSetMaxDamage] = useState(0);

  // const { containerRef, TooltipInPortal } = useTooltipInPortal({
  //   // use TooltipWithBounds
  //   detectBounds: true,
  //   // when tooltip containers are scrolled, this will correctly update the Tooltip position
  //   scroll: true,
  // });

  // useEffect(() => {
  //   console.log("Selected player context update");
  //   console.log(damageContext.get(selectedPlayerContext)?.get(0));
  //   console.log(player.damagers);
  // }, [selectedPlayerContext, damageContext]);

  useEffect(() => {
    return () => {
      const table = [...Array(20).keys()]
        .map((i) => i + 1)
        .map((d20) =>
          [...Array(8).keys()]
            .map((i) => i + 1)
            .map(
              (d8) =>
                ((d20 != 1 &&
                  d20 + d8 + player.attackBonus >= target.ac &&
                  d20 < target.ac) ||
                  d20 == 20) as any as number
            )
        );

      let improvementFactors = [...Array(20).keys()].map((threshold_gte) => {
        const improvedCases = s(
          table.slice(0, threshold_gte).map((pa_cases) => s(pa_cases))
        );
        return improvedCases * (20 - threshold_gte);
      });
      console.log({ improvementFactors });
      //
    };
  }, [target.ac, player.attackBonus]);

  const ordinalColorScale = scaleOrdinal({
    domain: [...Object.values(player.damagers).map((d) => d.key)]
      .map((x) =>
        [...Array(AdvantageTypes.length).keys()].map(
          (i) => x * AdvantageTypes.length + i
        )
      )
      .flat()
      .map((x) => x.toString()),
    range: [...schemeSet2]
      .map((x) => [...Array(AdvantageTypes.length).keys()].map((_) => x))
      .flat(),
  });

  console.log(ordinalColorScale.domain());
  console.log(ordinalColorScale.range());

  const customTheme = buildChartTheme({
    ...lightTheme,
    colors: ordinalColorScale.range(), // categorical colors, mapped to series via `dataKey`s
    tickLength: 2,
    gridColor: "white",
    gridColorDark: "white",
    xTickLineStyles: { strokeWidth: 50, color: "orange" },
  });

  return (
    <Aside
      width={{ sm: 400, md: 500, lg: 550, xl: 800 }}
      zIndex={101}
      style={{ zIndex: 10, maxWidth: 1000 }}
      // pr={"md"}
      hidden={hidden}
      hiddenBreakpoint={"lg"}
    >
      <Aside.Section grow>
        <div>
          <LegendOrdinal scale={ordinalColorScale} labelFormat={(l) => l}>
            {(labels) => (
              <div style={{ display: "flex", flexDirection: "row" }}>
                {labels
                  .filter((x) => x.index % 3 === 0)
                  .map((label, i) => (
                    <LegendItem
                      key={`legend-quantile-${i}`}
                      margin="0 5px"
                      onClick={() => {
                        // if (events) alert(`clicked: ${JSON.stringify(label)}`);
                      }}
                    >
                      <svg width={5} height={5}>
                        <rect fill={label.value} width={5} height={5} />
                      </svg>

                      <LegendLabel align="left" margin="0 0 0 4px">
                        {player.damagers[parseInt(label.text)]?.name}
                      </LegendLabel>
                    </LegendItem>
                  ))}
              </div>
            )}
          </LegendOrdinal>
          <XYChart
            height={300}
            xScale={{ type: "band" }}
            yScale={{ type: "linear" }}
            theme={customTheme}
          >
            <AnimatedAxis
              orientation="bottom"
              label={"AC"}
              hideTicks={false}
              numTicks={width > 1100 ? 30 : 15}
              tickLength={5}
              // tickLineProps={{ width: 20, style: { strokeWidth: 10 } }}
              tickStroke={"gray"}
              tickTransform={"translate(0,-1)"}
            />
            <AnimatedAxis
              orientation="left"
              label={"Average Damage"}
              hideTicks={false}
              hideZero={false}
            />

            <AnimatedGrid columns={false} numTicks={4} />

            <Tooltip
              snapTooltipToDatumX
              snapTooltipToDatumY
              showVerticalCrosshair
              applyPositionStyle
              detectBounds
              className={styles.tooltip}
              glyphStyle={{ width: "5" }}
              showSeriesGlyphs
              renderTooltip={({ tooltipData, colorScale }) => {
                return (
                  <div>
                    <div>
                      {Object.entries(tooltipData?.datumByKey ?? {}).map(
                        ([i, datum]) => {
                          let index = parseInt(datum.key);
                          let damagerIndex = Math.floor(
                            index / AdvantageTypes.length
                          );
                          let damager = player.damagers[damagerIndex];

                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                height: "100%",
                                paddingTop: 0,
                              }}
                            >
                              <ColorSwatch
                                color={ordinalColorScale(index.toString())}
                                size={13}
                                py={0}
                                my={0}
                              />
                              <Text pl={"xs"} py={0} my={0}>
                                {damager?.name} :{" "}
                                {(
                                  tooltipData?.datumByKey[i].datum as {
                                    x: number;
                                    y: number;
                                  }
                                ).y.toFixed(2)}
                              </Text>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              }}
            ></Tooltip>

            {Object.entries(player.damagers).map(
              ([damagerDex, damager], damagerIndex) =>
                AdvantageTypes.filter((x) => damager.advantageShow.get(x)).map(
                  (advantageType, i) => {
                    console.log("GRAPHED DATA:");
                    console.log(
                      [
                        ...(damageContext
                          ?.get(selectedPlayerContext)
                          ?.get(damager.key)
                          ?.get(advantageType)
                          ?.entries() || []),
                      ].map(([ac, dmg]) => ({
                        x: ac,
                        y: dmg,
                      }))
                    );
                    return (
                      <AnimatedLineSeries
                        key={
                          damagerIndex * AdvantageTypes.length +
                          AdvantageTypes.indexOf(advantageType)
                        }
                        dataKey={(
                          damagerIndex * AdvantageTypes.length +
                          AdvantageTypes.indexOf(advantageType)
                        ).toString()}
                        data={[
                          ...(damageContext
                            ?.get(selectedPlayerContext)
                            ?.get(damager.key)
                            ?.get(advantageType)
                            ?.entries() || []),
                        ].map(([ac, dmg]) => ({
                          x: ac,
                          y: dmg,
                        }))}
                        // color={ordinalColorScale(index)}
                        {...accessors}
                      />
                    );
                  }
                )
            )}
          </XYChart>

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

export default DamageGraphs;
