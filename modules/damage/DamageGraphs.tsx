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
} from "../../pages/Damage";
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
import { useTooltipInPortal, Portal } from "@visx/tooltip";

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

// // interface dice
//
// const getMean = (obj: diceNode) => {
//
//
//   if (obj.type === "die" && !obj.mods?.length) {
//     return obj.count.value * (obj.die.value / 2 + 0.5);
//   } else if (obj.type === "number") {
//     return obj.value;
//   }
// };

// const target_ac = 16;
// const bonus_to_hit = 0;
const s = (l: number[]) => l.reduce((a, b) => a + b, 0);
const MAX_AC = 30;
const NUM_WORKERS = 8;
const DamageGraphs = ({
  target,
  player,
}: {
  target: Target;
  player: Player;
}) => {
  const [dataSets, setDataSets] = useState<{
    [key: keyof Player["damagers"]]: { x: number; y: number }[];
  }>([]);

  // const [damageMeans, setDamageMeans] = useState<{
  //   [key: keyof Player["damagers"]]: number;
  // }>({});
  const workersRef = useRef<Worker[]>([]);
  const [legendScale, setLegendScale] = useState();
  const [workerPlayerCount, setWorkerPlayerCount] = useState(0);
  const damageContext = useContext(DamageDataContext)!;
  const selectedPlayerContext = useContext(SelectedPlayerContext)!;

  // scaleOrdinal({
  //   domain: ["a"],
  //   range: ["blue"],
  // }) as any as ScaleOrdinal<any, any, never>
  // const [setMaxDamage, setSetMaxDamage] = useState(0);
  // useEffect(() => {
  //   // let w = workerRef.current;
  //   workerRef.current = new Worker(
  //     new URL("/public/diceRollWorker.js", import.meta.url)
  //   );
  // }, []);

  // const { containerRef, TooltipInPortal } = useTooltipInPortal({
  //   // use TooltipWithBounds
  //   detectBounds: true,
  //   // when tooltip containers are scrolled, this will correctly update the Tooltip position
  //   scroll: true,
  // });

  useEffect(() => {
    let r = workersRef.current;

    //
    let damageMeanCalcs = {} as { [key: keyof Player["damagers"]]: number };
    let messagesReceived = 0;
    [...Array(NUM_WORKERS).keys()].map((i) => {
      r[i] = new Worker(new URL("/public/diceRollWorker.js", import.meta.url));
      r[i].onmessage = (event) => {
        //
        //   `Setting x:${i} y: ${event.data[1]} ${H(player.attackBonus, i)} ${i}`
        // );
        damageMeanCalcs[event.data[0]] = event.data[1];

        if (++messagesReceived == workerPlayerCount) {
          //
          //
          // setDamageMeans({ ...damageMeanCalcs });
          messagesReceived = 0;
        }
        //
      };
    });

    return () => {
      if (r) {
        r.map((w) => w.terminate());
      }
    };
  }, []);

  // useEffect(() => {
  //   //
  //
  //   const v = Object.entries(player.damagers).map(([key, damager]) =>
  //     [...Array(30).keys()].map((ac) => ({
  //       x: ac,
  //       y: H(player.attackBonus, ac) * damageMeans[parseInt(key)],
  //     }))
  //   );
  //   //
  //   Object.entries(player.damagers).map(([key, damager]) =>
  //     [...Array(30).keys()].map((ac) => {
  //       let x = {
  //         x: ac,
  //         y: H(player.attackBonus, ac) * damageMeans[parseInt(key)],
  //       };
  //       //
  //       //
  //     })
  //   );
  //
  //
  //
  //   setDataSets(v);
  // }, [player, damageMeans]);

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

      //   const table = Array.from({ length: 20 }, (x, i) => i + 1).map((d20) => {
      //   return Array.from({ length: 8 }, (x, i) => i + 1).map(
      //     (d8) =>
      //       ((d20 != 1 &&
      //         d20 + d8 + player.attackBonus >= target.ac &&
      //         d20 < target.ac) ||
      //         d20 == 20) as any as number
      //   );
      // });
      //
      let improvementFactors = [...Array(20).keys()].map((threshold_gte) => {
        const improvedCases = s(
          table.slice(0, threshold_gte).map((pa_cases) => s(pa_cases))
        );
        return improvedCases * (20 - threshold_gte);
      });
      //
    };
  }, [target.ac, player.attackBonus]);

  // const pmfToDataset = (pmf: PMF) => {};
  // useEffect(() => {
  //   debouncedUpdateGraphs();
  // }, [
  //   debouncedUpdateGraphs,
  //   player.damagers,
  //   player.attackBonus,
  //   player.spellSaveDC,
  // ]);

  // useEffect(() => {
  //   if (!damageMeans) {
  //     return;
  //   }
  //
  //
  //
  //   const ordinalColorScale = scaleOrdinal({
  //     domain: ["a", "b", "c", "d"],
  //     range: ["#66d981", "#71f5ef", "#4899f1", "#7d81f6"],
  //   });
  //
  //   // setLegendScale(ordinalColorScale);
  //   // setLegendScale(
  //   //   // scaleOrdinal({
  //   //   //   domain: ["baseline", ...Object.keys(dataSets)],
  //   //   //   range: schemeSet2 as string[],
  //   //   // })
  //   // );
  // }, [damageMeans]);
  // // const ordinalColorScale = scaleOrdinal({
  // //   domain: ["baseline", ...Object.keys(dataSets)],
  // //   range: ["#d0a981", ...schemeSet2],
  // // });
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
      width={{ sm: 400, md: 500, lg: 700 }}
      zIndex={101}
      style={{ zIndex: 10 }}
      pr={"md"}
    >
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
            numTicks={30}
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
              console.log(tooltipData);
              // console.log(player.damagers);
              return (
                // <Portal>
                <div>
                  <div
                  // style={{
                  //   position: "relative",
                  //   zIndex: 3000,
                  //   transformStyle: "preserve-3d",
                  //   opacity: 0.99,
                  // }}
                  >
                    {Object.entries(tooltipData?.datumByKey ?? {}).map(
                      ([i, datum]) => {
                        let index = parseInt(datum.key);
                        let damagerIndex = Math.floor(
                          index / AdvantageTypes.length
                        );
                        // console.log(damagerIndex);

                        // console.log(player.damagers[Math.floor(index / 3)]);

                        let damager = player.damagers[damagerIndex];

                        // console.log(ordinalColorScale(damagerIndex));
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
                              {damager.name} :{" "}
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
                  {/*{accessors.xAccessor(tooltipData.nearestDatum)}*/}
                  {/*{accessors.yAccessor(tooltipData.nearestDatum)}*/}
                </div>
                // </Portal>
              );
            }}
            // renderTooltip={({ tooltipData, colorScale }) => {
            //   console.log("render!");
            //   return <div key={"Eldritch Blast"}> </div>;
            // }}
          ></Tooltip>

          {Object.entries(player.damagers).map(
            ([damagerDex, damager], damagerIndex) =>
              AdvantageTypes.filter((x) => damager.advantageShow.get(x)).map(
                (advantageType, i) => {
                  // console.log("DATA KEY OF");
                  // console.log(damager);
                  //
                  // console.log(
                  //   damagerIndex * AdvantageTypes.length +
                  //     AdvantageTypes.indexOf(advantageType)
                  // );

                  // console.log(
                  //   ordinalColorScale(
                  //     damagerIndex * AdvantageTypes.length +
                  //       AdvantageTypes.indexOf(advantageType)
                  //   )
                  // );
                  let t = (
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

                  console.log("DATA KEY:");
                  console.log(t.props.dataKey);

                  // console.log("\n\nn\n\n\n\n\n\n\n\n");
                  console.log(damageContext);
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

          {/*{Object.entries(dataSets).map(([key, data]) => (*/}
          {/*  <AnimatedLineSeries*/}
          {/*    key={key}*/}
          {/*    dataKey={key}*/}
          {/*    data={data}*/}
          {/*    // color={ordinalColorScale(key)}*/}
          {/*    {...accessors}*/}
          {/*  />*/}
          {/*))}*/}
          {/*<LineSeries*/}
          {/*  dataKey={"baseline"}*/}
          {/*  data={[*/}
          {/*    { x: 9 + player.attackBonus, y: 0 },*/}
          {/*    {*/}
          {/*      x: 9 + player.attackBonus,*/}
          {/*      y: Math.max(...Object.values(damageMeans)),*/}
          {/*    },*/}
          {/*  ]}*/}
          {/*  {...accessors}*/}
          {/*/>*/}
          {/*<AnimatedLineSeries dataKey="Line 2" data={data2} {...accessors} />*/}
          {/*<Tooltip*/}
          {/*  snapTooltipToDatumX*/}
          {/*  snapTooltipToDatumY*/}
          {/*  showVerticalCrosshair*/}
          {/*  showSeriesGlyphs*/}
          {/*  // renderTooltip={({ tooltipData, colorScale }) => (*/}
          {/*  //   <div>*/}
          {/*  //     <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>*/}
          {/*  //       {tooltipData.nearestDatum.key}*/}
          {/*  //     </div>*/}
          {/*  //     {accessors.xAccessor(tooltipData.nearestDatum.datum)}*/}
          {/*  //     {', '}*/}
          {/*  //     {accessors.yAccessor(tooltipData.nearestDatum.datum)}*/}
          {/*  //   </div>*/}
          {/*  // )}*/}
          {/*/>*/}
        </XYChart>
      </div>
      {/*<Title order={3}>Precision Attack</Title>*/}
    </Aside>
  );
};

export default DamageGraphs;
