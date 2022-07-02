import React, { useContext, useEffect } from 'react';
import { LegendItem, LegendLabel, LegendOrdinal } from '@visx/legend';
import {
  ActionIcon, ColorSwatch, Text, useMantineColorScheme,
} from '@mantine/core';
import { ArrowsMaximize, ArrowsMinimize } from 'tabler-icons-react';
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  buildChartTheme,
  GlyphSeries,
  lightTheme,
  Tooltip,
  XYChart,
} from '@visx/xychart';
// import styles from '@damage/DamageGraphs/DamageGraphsCharts.module.css';
import { useViewportSize } from '@mantine/hooks';
import type { DamageData, Target } from '@pages/Damage';
import { scaleOrdinal } from '@visx/scale';
import { schemeSet2, schemeTableau10 } from 'd3-scale-chromatic';
import * as ColorConvert from 'color-convert';
import { NARROW_WIDTH } from '@damage/constants';

import type {
  AC, AdvantageType, DamageInfo, Player, PlayerKey,
  Damager,
} from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import { DamageDataContext, SelectedPlayerContext } from '@damage/contexts';
import type Fraction from 'fraction.js';
import { GlyphCross } from '@visx/glyph';
import type { SetState } from '@utils/typehelpers';

const s = (l: number[]) => l.reduce((a, b) => a + b, 0);
const lineSeriesProps = {
  xAccessor: (d: {x: number}) => d.x,
  yAccessor: (d: {y: number}) => d.y,
};
const STROKE_DASH_OFFSET: Record<AdvantageType, string> = {
  superadvantage: '22 5',
  advantage: '11 7',
  normal: '0 0',
  disadvantage: '3 7',
  superdisadvantage: '1 15',
};
const sumDamagerMeans = (damagers: Map<AC, DamageInfo>[]) => (
  [...(damagers?.[0]?.entries() || [])]
    .map(([ac, _]) => (
      {
        x: ac,
        y: damagers.map((damager) => damager.get(ac)?.mean).reduce((acc, n) => acc + (n?.valueOf() || 0), 0),
      })));

const DamageLineSeries = ({
  data,
  keyBase,
  advantageType,
  colorScaler,
}: {
  data: {x:number, y:number, bestType?: Damager['damagerType']}[]
  keyBase: number,
  advantageType: AdvantageType,
  colorScaler: (k: string) => string }) => (
    <>
      <AnimatedLineSeries
        key={`${keyBase}|${advantageType}`}
        dataKey={(
          keyBase * AdvantageTypes.length
          + AdvantageTypes.indexOf(advantageType)
        ).toString()}
        data={data}
        colorAccessor={(dataKey) => colorScaler(dataKey)}
        {...lineSeriesProps}
        strokeDasharray={STROKE_DASH_OFFSET[advantageType]}
        strokeWidth={3}
      />
      <GlyphSeries
        dataKey={(
          keyBase * AdvantageTypes.length
          + AdvantageTypes.indexOf(advantageType)
        ).toString()}
        data={(data)}
        size={(d) => (d.bestType === 'powerAttack' ? 35 : 0)}
        renderGlyph={(d) => (<GlyphCross left={d.x} top={d.y} size={d.size} />)}
        {...lineSeriesProps}
      />
    </>
);

type DamageDatum = { x: AC, y: number };
const DamageGraphsChart = ({
  target,
  players,
  hidden,
  graphWidth,
  setGraphWidth,
  graphTotals,
  showGraphTotalAdvantage,
}: {
  target: Target;
  players: { [key: PlayerKey]: Player };
  hidden: boolean;
  graphWidth: string;
  setGraphWidth: SetState<string>;
  graphTotals: boolean;
  showGraphTotalAdvantage:Record<AdvantageType, boolean>
}) => {
  // const [dataSets, setDataSets] = useState<{
  //   [key: keyof Player['damagers']]: { x: number; y: number }[];
  // }>([]);
  const { height, width } = useViewportSize();

  const damageContext = useContext(DamageDataContext)!;
  const selectedPlayerContext = useContext(SelectedPlayerContext)!;

  // const [widthWide, toggleWidthWide] = useToggle('50%', ['50%', '100%']);
  // const [widthNarrow, toggleWidthNarrow] = useToggle('0%', ['0%', '100%']);
  // const [state, setState] = useState(initState);
  const { colorScheme } = useMantineColorScheme();
  const darkTheme = colorScheme === 'dark';

  useEffect(() => {
    if (width <= NARROW_WIDTH) {
      if (hidden) {
        setGraphWidth('0');
      } else {
        setGraphWidth('100vw');
      }
    } else {
      setGraphWidth('50%');
    }
  }, [width, setGraphWidth, hidden]);

  // useEffect(() => () => {
  //   const table = [...Array(20).keys()]
  //     .map((i) => i + 1)
  //     .map((d20) => [...Array(8).keys()]
  //       .map((i) => i + 1)
  //       .map(
  //         (d8) => ((d20 != 1
  //                 && d20 + d8 + players[selectedPlayerContext].attackBonus >= target.ac
  //                 && d20 < target.ac)
  //                 || d20 == 20) as any as number,
  //       ));
  //   const improvementFactors = [...Array(20).keys()].map((threshold_gte) => {
  //     const improvedCases = s(
  //       table.slice(0, threshold_gte).map((pa_cases) => s(pa_cases)),
  //     );
  //     return improvedCases * (20 - threshold_gte);
  //   });
  //     // console.log({ improvementFactors });
  //     //
  // }, [target.ac, players[selectedPlayerContext].attackBonus]);

  const baseColorScale = scaleOrdinal({
    domain: Object.values(players[selectedPlayerContext].damagers).map((d) => d.key.toString()),
    range: [...schemeTableau10, ...schemeSet2],
  });

  // const colorTransform = (hex: string, modifier: number) => {
  //   const lab = ColorConvert.hex.lab(hex);
  //   const modifierFactor = (modifier * 1.1) ** 3;
  //
  //   const l = lab[0];
  //   const a = lab[1];
  //   const b = lab[2];
  //   let l_new = l;
  //   let a_new = a;
  //   let b_new = b;
  //
  //   if (a > 0) {
  //     a_new += 8 * modifier;
  //     b_new += 5 * modifier;
  //   }
  //   if (a < 0) {
  //     a_new -= 8 * modifier;
  //     b_new -= 5 * modifier;
  //   }
  //   if (a < 0 && b > 0) {
  //     a_new -= 3 * modifier;
  //     b_new += 3 * modifier;
  //   }
  //   if (b > 0) {
  //     b_new += 8 * modifier;
  //   }
  //   if (b < 0) {
  //     b_new -= 12 * modifier;
  //     a_new += 5 * modifier;
  //     l_new -= 6 * modifier;
  //   }
  //   if (l > 0) {
  //     l_new += 5 * modifier;
  //   }
  //   if (l < 0) {
  //     l_new -= 5 * modifier;
  //   }
  //
  //   const newLab = [l_new, a_new, b_new] as [number, number, number];
  //   return `#${ColorConvert.lab.hex(newLab)}`;
  // };
  // const CS_COLORGORICAL = ['#42952e', '#b735e8', '#91da4d', '#f2579c', '#4aeeb6'];
  // const CS = ['#ff88f3', '#51c458', '#e65240', '#0171b4', '#d3960f'];
  // console.log(
  //   CS.slice(0, 6).flatMap((x) => [...Array(5).keys()]
  //     .map((x) => x - 2)
  //     .map((advantageModifier) => colorTransform(x, advantageModifier))),
  // );

  const colorScaler = (dataKey: string) => {
    const k = Number(dataKey);

    const damagerDex = Math.floor(k / AdvantageTypes.length);

    // console.log(baseColorScale(damagerDex));

    const advantageModifier = AdvantageTypes.indexOf('normal') - (k % AdvantageTypes.length);

    const hsl = ColorConvert.hex.hsl(baseColorScale(damagerDex.toString()));
    // console.log(hsl);

    const lab = ColorConvert.hex.lab(baseColorScale(damagerDex.toString()));
    // return colorTransform(
    //   baseColorScale(damagerDex.toString()),
    //   advantageModifier
    // );
    const newLab = [
      lab[0] + 15 * advantageModifier,
      lab[1] + 15 * advantageModifier,
      lab[2] + 15 * advantageModifier,
    ] as [number, number, number];
    return `#${ColorConvert.lab.hex(newLab)}`;

    const newHsl = [
      hsl[0] + 7 * advantageModifier,
      hsl[1] + Math.abs(advantageModifier) * 8,
      hsl[2] + 10 * advantageModifier,
    ] as [number, number, number];
    console.log(newHsl);
    return `#${ColorConvert.hsl.hex(newHsl)}`;
  };

  const colorScalerRange = graphTotals ? players : players[selectedPlayerContext].damagers;

  const ordinalColorScale = scaleOrdinal({
    domain: [...Object.values(colorScalerRange).map((d) => d.key)]
      .map((x) => [...Array(AdvantageTypes.length).keys()].map(
        (i) => x * AdvantageTypes.length + i,
      ))
      .flat()
      .map((x) => x.toString()),
    range: [...Object.values(colorScalerRange).map((d) => d.key)]
      .map((x) => [...Array(AdvantageTypes.length).keys()].map(
        (i) => x * AdvantageTypes.length + i,
      ))
      .flat()
      .map((x) => x.toString())
      .map((x) => colorScaler(x)),
  });

  const customTheme = buildChartTheme({
    ...lightTheme,
    colors: ordinalColorScale.range(), // categorical colors, mapped to series via `dataKey`s
    tickLength: 2,
    gridColor: 'white',
    gridColorDark: 'white',
    xTickLineStyles: { strokeWidth: 50, color: 'orange' },
  });

  return (
    <div id="damageChart">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
        id="damageChartLegend"
      >
        {graphTotals ? (
          <LegendOrdinal scale={ordinalColorScale} labelFormat={(l) => l}>
            {(labels) => (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {labels
                  .filter((x) => showGraphTotalAdvantage[(
                    AdvantageTypes[x.index % AdvantageTypes.length]
                  )])
                  .map((label) => (
                    <LegendItem
                      key={`legend-quantile-${label.text}`}
                      margin="0 5px"
                    >
                      <svg width={5} height={5}>
                        <rect fill={label.value} width={5} height={5} />
                      </svg>

                      <LegendLabel align="left" margin="0 0 0 4px">
                        {`${
                          players[
                            Math.floor(
                              Number(label.text) / AdvantageTypes.length,
                            )
                          ]?.name
                        } (${
                          AdvantageTypes[label.index % AdvantageTypes.length]
                        })`}
                      </LegendLabel>
                    </LegendItem>
                  ))}
              </div>
            )}

          </LegendOrdinal>

        ) : (
          <LegendOrdinal scale={ordinalColorScale} labelFormat={(l) => l}>
            {(labels) => (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {labels
                  .filter((x) => players[selectedPlayerContext].damagers[
                    Math.floor(Number(x.text) / AdvantageTypes.length)
                  ].advantageShow.get(
                    AdvantageTypes[x.index % AdvantageTypes.length],
                  ))
                  .map((label) => (
                    <LegendItem
                      key={`legend-quantile-${label.text}`}
                      margin="0 5px"
                    >
                      <svg width={5} height={5}>
                        <rect fill={label.value} width={5} height={5} />
                      </svg>

                      <LegendLabel align="left" margin="0 0 0 4px">
                        {`${
                          players[selectedPlayerContext].damagers[
                            Math.floor(
                              Number(label.text) / AdvantageTypes.length,
                            )
                          ]?.name
                        } (${
                          AdvantageTypes[label.index % AdvantageTypes.length]
                        })`}
                      </LegendLabel>
                    </LegendItem>
                  ))}
              </div>
            )}
          </LegendOrdinal>
        )}
        <LegendItem key="SS">
          <svg width={30} height={35}>
            <GlyphCross size={35} top={35 / 2} left={35 / 2} />
          </svg>
          <LegendLabel>Using SS/GWM</LegendLabel>
        </LegendItem>
        <ActionIcon
          style={{ marginRight: '5%', marginLeft: 'auto' }}
          onClick={() => {
            // if (width > 900) {
            //   setGraphWidth(graphWidth === '50%' ? '100%' : '50%');
            // } else {
            //   console.log(graphWidth === '0%' ? '100%' : '0%');
            //   setGraphWidth(graphWidth === '0%' ? '100%' : '0%');
            // }
          }}
        >
          {graphWidth === '50%' ? <ArrowsMaximize /> : <ArrowsMinimize />}
        </ActionIcon>
      </div>
      <XYChart
        height={Math.floor(height * 0.35)}
        xScale={{ type: 'band' }}
        yScale={{ type: 'linear' }}
        theme={customTheme}
      >
        <AnimatedAxis
          orientation="bottom"
          label="AC"
          hideTicks={false}
          numTicks={width > 1100 ? 30 : 15}
          tickLength={5}
          // tickLineProps={{ width: 20, style: { strokeWidth: 10 } }}
          tickStroke={darkTheme ? 'white' : 'black'}
          tickLabelProps={() => ({
            fill: darkTheme ? 'white' : 'black',
          })}
          tickTransform="translate(0,-1)"
          labelProps={{ fill: darkTheme ? 'white' : 'black' }}
          labelOffset={20}
        />
        <AnimatedAxis
          orientation="left"
          label="Average Damage"
          hideTicks={false}
          hideZero={false}
          tickStroke={darkTheme ? 'white' : 'black'}
          tickLabelProps={() => ({
            fill: darkTheme ? 'white' : 'black',
          })}
          labelProps={{ fill: darkTheme ? 'white' : 'black' }}
          labelOffset={35}
        />

        <AnimatedGrid columns={false} numTicks={4} />

        <Tooltip
          snapTooltipToDatumX
          snapTooltipToDatumY
          showVerticalCrosshair
          applyPositionStyle
          detectBounds
          // className={styles.tooltip}
          glyphStyle={{ width: '5' }}
          showSeriesGlyphs
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          renderTooltip={({ tooltipData }) => (
            <div>
              <div>
                {Object.entries(tooltipData?.datumByKey ?? {}).map(
                  ([i, datum]) => {
                    const index = Number(datum.key);
                    const damagerIndex = Math.floor(
                      index / AdvantageTypes.length,
                    );
                    const damager = players[selectedPlayerContext].damagers[damagerIndex];

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%',
                          paddingTop: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <ColorSwatch
                          color={ordinalColorScale(index.toString())}
                          size={13}
                          py={0}
                          my={0}
                        />
                        <Text pl="xs" py={0} my={0}>
                          {`${damager?.name} (${
                            AdvantageTypes[index % AdvantageTypes.length]
                          })`}
                          :
                          {' '}
                          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */}
                          { (tooltipData?.datumByKey[i].datum as {y: Fraction}).y.valueOf() }
                        </Text>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        />

        { graphTotals
          ? AdvantageTypes.filter((x) => showGraphTotalAdvantage[x]).map((advType) => [
            advType,
            Object.values(players).map((player) => [player.key, sumDamagerMeans([...(damageContext?.get(player.key)?.values() || [])]
              .map((x) => (x.get(advType) || new Map<AC, DamageInfo>()))) as DamageDatum[]] as [PlayerKey, DamageDatum[]])] as [AdvantageType, [PlayerKey, DamageDatum[]][]])
            .flatMap(([advType, playerDamageTups]) => playerDamageTups.map(([playerKey, damageData]) => <DamageLineSeries data={damageData} keyBase={playerKey} advantageType={advType} colorScaler={colorScaler} />))

          : Object.entries(players[selectedPlayerContext].damagers).map(([damagerDex, damager]) => AdvantageTypes.filter(
            (x) => damager.advantageShow.get(x) && !damager.disabled,
          ).map((advantageType) => (
            <DamageLineSeries
              keyBase={damager.key}
              data={[
                ...(damageContext
                  ?.get(selectedPlayerContext)
                  ?.get(damager.key)
                  ?.get(advantageType)
                  ?.entries() || []),
              ].map(([ac, dmg]) => ({
                x: ac,
                y: dmg.mean.valueOf(),
                bestType: dmg.bestType,
              }))}
              colorScaler={colorScaler}
              advantageType={advantageType}
            />
          )))}

      </XYChart>
    </div>
  );
};
export default DamageGraphsChart;
