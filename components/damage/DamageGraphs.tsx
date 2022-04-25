import React, { useEffect, useRef, useState } from "react";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  buildChartTheme,
  LineSeries,
  XYChart,
} from "@visx/xychart";
import { Aside, Title } from "@mantine/core";
import { Target } from "../../pages/Damage";
import { Damager, Player } from "./DamagerCard/PlayerCard";
import { useDebouncedCallback } from "use-debounce";
import queryString from "query-string";
import { DiceRoller } from "dice-roller-parser";
import { Line, LinePath } from "@visx/shape";
import { Scale, Legend } from "@visx/visx";
import { schemeSet2 } from "d3-scale-chromatic";
import { scaleOrdinal } from "@visx/scale";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { ScaleOrdinal } from "d3-scale";
import { lightTheme } from "@visx/xychart";
import debounce from "lodash.debounce";
import { make_pmf } from "../../utils/math";

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

const getMean = (obj: any) => {
  if (obj.type === "die" && !obj.mods?.length) {
    return obj.count.value * (obj.dice.value / 2 + 0.5);
  } else if (obj.type === "number") {
    return obj.value;
  }
};

const simpleProcess = (damage: string): number | undefined => {
  let parsedDamage = diceRoller.parse(damage) as {
    head: object;
    ops: object[];
    root: boolean;
    type: string;
  };
  let mean = 0;
  if (!["die", "number"].includes((parsedDamage as any).head.type)) {
    return;
  }
  let headDmg = getMean(parsedDamage.head);
  if (!headDmg) {
    return;
  }
  mean += headDmg;
};

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

  const [damageMeans, setDamageMeans] = useState<{
    [key: keyof Player["damagers"]]: number;
  }>({});
  const workersRef = useRef<Worker[]>([]);
  const [legendScale, setLegendScale] = useState();
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

  console.log(make_pmf(8));

  useEffect(() => {
    let r = workersRef.current;

    console.log("booting up workers");
    let damageMeanCalcs = {} as { [key: keyof Player["damagers"]]: number };
    let messagesReceived = 0;
    [...Array(NUM_WORKERS).keys()].map((i) => {
      r[i] = new Worker(new URL("/public/diceRollWorker.js", import.meta.url));
      r[i].onmessage = (event) => {
        // console.log(
        //   `Setting x:${i} y: ${event.data[1]} ${H(player.attackBonus, i)} ${i}`
        // );
        damageMeanCalcs[event.data[0]] = event.data[1];

        if (++messagesReceived == Object.keys(player.damagers).length) {
          console.log("SETTING DAMAGE MEANS :) new:");
          console.log({ damageMeanCalcs });
          setDamageMeans({ ...damageMeanCalcs });
          messagesReceived = 0;
        }
        console.log(`Setting data ${messagesReceived}`);
      };
    });

    return () => {
      if (r) {
        r.map((w) => w.terminate());
      }
    };
  }, []);

  useEffect(() => {
    console.log("Damage means changed :)");
    const v = Object.entries(player.damagers).map(
      ([key, damager]) =>
        [...Array(30).keys()].map((ac) => ({
          x: ac,
          y: H(player.attackBonus, ac) * damageMeans[parseInt(key)],
        }))
      // Array.from({ length: 30 }, (x, i) => i).map((ac) => ({
      //   x: ac,
      //   y: H(player.attackBonus, ac) * damageMeans[parseInt(key)],
      // }))
    );
    console.log("processing :)");
    Object.entries(player.damagers).map(([key, damager]) =>
      [...Array(30).keys()].map((ac) => {
        let x = {
          x: ac,
          y: H(player.attackBonus, ac) * damageMeans[parseInt(key)],
        };
        console.log(x);
        console.log(damageMeans);
      })
    );
    console.log("Setting data sets !!!: :O");
    console.log(player.damagers);

    console.log(damageMeans);
    console.log({ v });
    console.log("DONE!");
    setDataSets(v);
  }, [player, damageMeans]);

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
      console.log(table);
      let improvementFactors = [...Array(20).keys()].map((threshold_gte) => {
        const improvedCases = s(
          table.slice(0, threshold_gte).map((pa_cases) => s(pa_cases))
        );
        return improvedCases * (20 - threshold_gte);
      });
      console.log(improvementFactors);
    };
  }, [target.ac, player.attackBonus]);

  const debouncedUpdateGraphs = useDebouncedCallback(
    () => {
      Object.entries(player.damagers).map(([key, damager]) => {
        // Array.from({ length: 30 }, (x, i) => i).map((ac) => {
        const r = workersRef.current;
        if (r) {
          // r.map((w) => {
          console.log(damager.damage);
          console.log(`processing ${key}`);
          r[parseInt(key) % NUM_WORKERS].postMessage({
            index: key,
            damage: damager.damage,
          });
          // });
        }
        // });
      });

      // Array.from({ length: 30 }, (x, i) => i + 1).map((ac) => ({
      //     }));
      // let workers = [];
      // for (let i = 0; i < 30; i++) {
      //   workers[i] =
      // }
      // const v = Object.entries(player.damagers).map(([key, damager]) => {
      //   Array.from({ length: 30 }, (x, i) => i + 1).map((ac) => ({
      //     x: ac,
      //     y: H(player.attackBonus, target.ac) * E(damager.damage)
      //   }));
      // });
    },
    1000,
    { leading: true }
  );

  useEffect(() => {
    debouncedUpdateGraphs();
  }, [debouncedUpdateGraphs, player.damagers]);

  console.log(diceRoller.parse("2d8+1d4+4"));
  useEffect(() => {
    if (!damageMeans) {
      return;
    }
    console.log({ dataSets });
    console.log({ damageMeans });
    console.log(["baseline", ...Object.keys(dataSets)]);
    const ordinalColorScale = scaleOrdinal({
      domain: ["a", "b", "c", "d"],
      range: ["#66d981", "#71f5ef", "#4899f1", "#7d81f6"],
    });

    // setLegendScale(ordinalColorScale);
    // setLegendScale(
    //   // scaleOrdinal({
    //   //   domain: ["baseline", ...Object.keys(dataSets)],
    //   //   range: schemeSet2 as string[],
    //   // })
    // );
  }, [damageMeans]);
  // const ordinalColorScale = scaleOrdinal({
  //   domain: ["baseline", ...Object.keys(dataSets)],
  //   range: ["#d0a981", ...schemeSet2],
  // });
  const ordinalColorScale = scaleOrdinal({
    domain: [...Object.keys(dataSets)],
    range: [...schemeSet2],
  });

  const customTheme = buildChartTheme({
    ...lightTheme,
    colors: [...schemeSet2], // categorical colors, mapped to series via `dataKey`s
    tickLength: 2,
    gridColor: "white",
    gridColorDark: "white",
  });

  return (
    <Aside width={{ sm: 400, md: 500, lg: 700 }}>
      <div>
        <LegendOrdinal scale={ordinalColorScale} labelFormat={(l) => l}>
          {(labels) => (
            <div style={{ display: "flex", flexDirection: "row" }}>
              {labels.map((label, i) => (
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
          <AnimatedAxis orientation="bottom" label={"AC"} />
          <AnimatedAxis orientation="left" label={"Average Damage"} />

          <AnimatedGrid columns={false} numTicks={4} />
          {Object.entries(dataSets).map(([key, data]) => (
            <AnimatedLineSeries
              key={key}
              dataKey={key}
              data={data}
              // color={ordinalColorScale(key)}
              {...accessors}
            />
          ))}
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
      <Title order={3}>Precision Attack</Title>
    </Aside>
  );
};

export default DamageGraphs;
