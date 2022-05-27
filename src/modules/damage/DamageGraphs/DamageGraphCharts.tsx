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
  lightTheme,
  Tooltip,
  XYChart,
} from '@visx/xychart';
import styles from '@damage/DamageGraphs/DamageGraphsCharts.module.css';
import { useViewportSize } from '@mantine/hooks';
import type { Target } from '@pages/Damage';
import { scaleOrdinal } from '@visx/scale';
import { schemeSet2, schemeTableau10 } from 'd3-scale-chromatic';
import * as ColorConvert from 'color-convert';
import { NARROW_WIDTH } from '@damage/constants';
import type { AdvantageType, Player } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import { DamageDataContext, SelectedPlayerContext } from '@damage/contexts';

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
  //                 && d20 + d8 + player.attackBonus >= target.ac
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
  // }, [target.ac, player.attackBonus]);

  const baseColorScale = scaleOrdinal({
    domain: Object.values(player.damagers).map((d) => d.key.toString()),
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
  const ordinalColorScale = scaleOrdinal({
    domain: [...Object.values(player.damagers).map((d) => d.key)]
      .map((x) => [...Array(AdvantageTypes.length).keys()].map(
        (i) => x * AdvantageTypes.length + i,
      ))
      .flat()
      .map((x) => x.toString()),
    range: [...Object.values(player.damagers).map((d) => d.key)]
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

  const STROKE_DASH_OFFSET: Record<AdvantageType, string> = {
    superadvantage: '22 5',
    advantage: '11 7',
    normal: '0 0',
    disadvantage: '3 7',
    superdisadvantage: '1 15',
  };

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
        <LegendOrdinal scale={ordinalColorScale} labelFormat={(l) => l}>
          {(labels) => (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {labels
                .filter((x) => player.damagers[
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
                        player.damagers[
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
          className={styles.tooltip}
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
                    const damager = player.damagers[damagerIndex];

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
                          {(
                              tooltipData?.datumByKey[i].datum as {
                                x: number;
                                y: number;
                              }
                          ).y.toFixed(2)}
                        </Text>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        />

        {Object.entries(player.damagers).map(([damagerDex, damager]) => AdvantageTypes.filter(
          (x) => damager.advantageShow.get(x) && !damager.disabled,
        ).map((advantageType) => (
          <AnimatedLineSeries
            key={
                    damager.key * AdvantageTypes.length
                    + AdvantageTypes.indexOf(advantageType)
                  }
            dataKey={(
              Number(damagerDex) * AdvantageTypes.length
                    + AdvantageTypes.indexOf(advantageType)
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
        )))}
      </XYChart>
    </div>
  );
};
export default DamageGraphsChart;
