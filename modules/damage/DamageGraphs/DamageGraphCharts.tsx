import React, { useContext, useEffect, useState } from "react";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import {
  AdvantageType,
  AdvantageTypes,
  Player,
} from "@damage/DamagerCard/PlayerCard";
import { ActionIcon, ColorSwatch, Text } from "@mantine/core";
import { ArrowsMaximize, ArrowsMinimize } from "tabler-icons-react";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  buildChartTheme,
  lightTheme,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import styles from "@damage/DamageGraphs/DamageGraphsCharts.module.css";
import { useViewportSize } from "@mantine/hooks";
import {
  DamageDataContext,
  SelectedPlayerContext,
  Target,
} from "@pages/Damage";
import { scaleOrdinal } from "@visx/scale";
import { schemeSet2, schemeTableau10 } from "d3-scale-chromatic";
import * as ColorConvert from "color-convert";

const s = (l: number[]) => l.reduce((a, b) => a + b, 0);
const accessors = {
  xAccessor: (d: any) => d.x,
  yAccessor: (d: any) => d.y,
};

const DamageGraphsChart = ({
  target,
  player,
  hidden,
  graphWidth,
  setGraphWidth,
}: {
  target: Target;
  player: Player;
  hidden: boolean;
  graphWidth: string;
  setGraphWidth: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [dataSets, setDataSets] = useState<{
    [key: keyof Player["damagers"]]: { x: number; y: number }[];
  }>([]);
  const { height, width } = useViewportSize();

  const damageContext = useContext(DamageDataContext)!;
  const selectedPlayerContext = useContext(SelectedPlayerContext)!;

  const [w, setW] = useState(width * 0.4);

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
      // console.log({ improvementFactors });
      //
    };
  }, [target.ac, player.attackBonus]);

  const baseColorScale = scaleOrdinal({
    domain: Object.values(player.damagers).map((d) => d.key.toString()),
    range: [...schemeTableau10, ...schemeSet2],
  });

  const colorTransform = (hex: string, modifier: number) => {
    let lab = ColorConvert.hex.lab(hex);
    let modifierFactor = (modifier * 1.1) ** 3;

    let l = lab[0];
    let a = lab[1];
    let b = lab[2];
    let l_new = l;
    let a_new = a;
    let b_new = b;

    if (a > 0) {
      a_new += 8 * modifier;
      b_new += 5 * modifier;
    }
    if (a < 0) {
      a_new -= 8 * modifier;
      b_new -= 5 * modifier;
    }
    if (a < 0 && b > 0) {
      a_new -= 3 * modifier;
      b_new += 3 * modifier;
    }
    if (b > 0) {
      b_new += 8 * modifier;
    }
    if (b < 0) {
      b_new -= 12 * modifier;
      a_new += 5 * modifier;
      l_new -= 6 * modifier;
    }
    if (l > 0) {
      l_new += 5 * modifier;
    }
    if (l < 0) {
      l_new -= 5 * modifier;
    }

    let newLab = [l_new, a_new, b_new] as [number, number, number];
    return `#${ColorConvert.lab.hex(newLab)}`;
  };
  let CS_COLORGORICAL = ["#42952e", "#b735e8", "#91da4d", "#f2579c", "#4aeeb6"];
  let CS = ["#ff88f3", "#51c458", "#e65240", "#0171b4", "#d3960f"];
  console.log(
    CS.slice(0, 6).flatMap((x) => {
      return [...Array(5).keys()]
        .map((x) => x - 2)
        .map((advantageModifier) => {
          return colorTransform(x, advantageModifier);
        });
    })
  );

  const colorScaler = (dataKey: string) => {
    let k = parseInt(dataKey);

    let damagerDex = Math.floor(k / AdvantageTypes.length);

    // console.log(baseColorScale(damagerDex));

    let advantageModifier =
      AdvantageTypes.indexOf("normal") - (k % AdvantageTypes.length);

    let hsl = ColorConvert.hex.hsl(baseColorScale(damagerDex.toString()));
    // console.log(hsl);

    let lab = ColorConvert.hex.lab(baseColorScale(damagerDex.toString()));
    // return colorTransform(
    //   baseColorScale(damagerDex.toString()),
    //   advantageModifier
    // );
    let newLab = [
      lab[0] + 15 * advantageModifier,
      lab[1] + 15 * advantageModifier,
      lab[2] + 15 * advantageModifier,
    ] as [number, number, number];
    return `#${ColorConvert.lab.hex(newLab)}`;

    let newHsl = [
      hsl[0] + 7 * advantageModifier,
      hsl[1] + Math.abs(advantageModifier) * 8,
      hsl[2] + 10 * advantageModifier,
    ] as [number, number, number];
    console.log(newHsl);
    return `#${ColorConvert.hsl.hex(newHsl)}`;
  };
  const ordinalColorScale = scaleOrdinal({
    domain: [...Object.values(player.damagers).map((d) => d.key)]
      .map((x) =>
        [...Array(AdvantageTypes.length).keys()].map(
          (i) => x * AdvantageTypes.length + i
        )
      )
      .flat()
      .map((x) => x.toString()),
    range: [...Object.values(player.damagers).map((d) => d.key)]
      .map((x) =>
        [...Array(AdvantageTypes.length).keys()].map(
          (i) => x * AdvantageTypes.length + i
        )
      )
      .flat()
      .map((x) => x.toString())
      .map((x) => colorScaler(x)),
  });

  // console.log(ordinalColorScale.domain());
  // console.log(ordinalColorScale.range());

  const customTheme = buildChartTheme({
    ...lightTheme,
    colors: ordinalColorScale.range(), // categorical colors, mapped to series via `dataKey`s
    tickLength: 2,
    gridColor: "white",
    gridColorDark: "white",
    xTickLineStyles: { strokeWidth: 50, color: "orange" },
  });

  const STROKE_DASH_OFFSET: Record<AdvantageType, string> = {
    superadvantage: "20 5",
    advantage: "10 7",
    normal: "0 0",
    disadvantage: "1 10",
    superdisadvantage: "1 2 ",
  };

  return (
    <div id={"damageChart"}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
        id={"damageChartLegend"}
      >
        <LegendOrdinal scale={ordinalColorScale} labelFormat={(l) => l}>
          {(labels) => (
            <div style={{ display: "flex", flexDirection: "row" }}>
              {labels
                .filter((x) =>
                  player.damagers[
                    Math.floor(parseInt(x.text) / AdvantageTypes.length)
                  ].advantageShow.get(
                    AdvantageTypes[x.index % AdvantageTypes.length]
                  )
                )
                .map((label, i) => {
                  // console.log(label.text);
                  return (
                    <LegendItem
                      key={`legend-quantile-${i}`}
                      margin="0 5px"
                      // onClick={expandHandler}
                    >
                      <svg width={5} height={5}>
                        <rect fill={label.value} width={5} height={5} />
                      </svg>

                      <LegendLabel align="left" margin="0 0 0 4px">
                        {`${
                          player.damagers[
                            Math.floor(
                              parseInt(label.text) / AdvantageTypes.length
                            )
                          ]?.name
                        } (${
                          AdvantageTypes[label.index % AdvantageTypes.length]
                        })`}
                      </LegendLabel>
                    </LegendItem>
                  );
                })}
            </div>
          )}
        </LegendOrdinal>
        <ActionIcon
          style={{ marginRight: "5%", marginLeft: "auto" }}
          onClick={() => setGraphWidth((w) => (w === "50%" ? "100%" : "50%"))}
        >
          {graphWidth === "50%" ? <ArrowsMaximize /> : <ArrowsMinimize />}
        </ActionIcon>
      </div>
      <XYChart
        height={Math.floor(height * 0.35)}
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
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
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
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                          }}
                        >
                          <ColorSwatch
                            color={ordinalColorScale(index.toString())}
                            size={13}
                            py={0}
                            my={0}
                          />
                          <Text pl={"xs"} py={0} my={0}>
                            {`${damager?.name} (${
                              AdvantageTypes[index % AdvantageTypes.length]
                            })`}
                            :{" "}
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
                    colorAccessor={(dataKey) => colorScaler(dataKey)}
                    // color={ordinalColorScale(index)}
                    {...accessors}
                    strokeDasharray={STROKE_DASH_OFFSET[advantageType]}
                    strokeWidth={3}
                  />
                );
              }
            )
        )}
      </XYChart>
    </div>
  );
};
export default DamageGraphsChart;