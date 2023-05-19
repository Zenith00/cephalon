import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getRandomNormal, getSeededRandom } from '@visx/mock-data';
// import genStats from '@visx/mock-data/lib/generators/genStats';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { BoxPlot, ViolinPlot } from '@visx/stats';
import type { SaveGraphOptions } from '../../routes/Saves';
import { defaultStyles as defaultTooltipStyles, Tooltip, withTooltip } from '@visx/tooltip';
import type { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { PatternLines } from '@visx/pattern';
// import Pluralize from 'pluralize';
import { Line } from '@visx/shape';

interface TooltipData {
  name?: string;
  min?: number;
  median?: number;
  mean?: number;
  max?: number;
  firstQuartile?: number;
  thirdQuartile?: number;
}

export type BoxplotProps = {
  width: number;
  height: number;
  saveGraphOptions: SaveGraphOptions,
  binData: Record<Flavor<string, 'bin'>, {value: number, count: number}[]>
  boxplot: Record<Flavor<string, 'bin'>, {x: string, min: number, max: number, median: number, firstQuartile: number, thirdQuartile: number, count: number}>
  globalRange: [number, number],
  title: string
};

// interface SaveGraphProps extends BoxplotProps {
//   metadata : {selectedSave: SaveTypes[number]}
// }

const SaveGraphs = withTooltip<BoxplotProps, TooltipData>(({
  width,
  height,
  saveGraphOptions,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  showTooltip,
  hideTooltip,
  binData, boxplot, globalRange, title,
}: (BoxplotProps & WithTooltipProvidedProps<TooltipData>)) => {
  const seededRandom = getSeededRandom(0.1);
  const randomNormal = getRandomNormal.source(getSeededRandom(0.789))(4, 3);
  // const data: Stats[] = genStats(5, randomNormal, () => 10 * seededRandom());
  // const allValues: number[] = [];

  const MARGIN = {
    BOTTOM: 30,
    TOP: 20,
    LEFT: 60,
  };
  const values = Object.values(boxplot).map(((boxdata) => [boxdata.min, boxdata.max])).flat(2);
  const domain = saveGraphOptions.globalYAxis ? globalRange : [Math.min(...values), Math.max(...values)];
  const yScale = scaleLinear<number>({
    range: [height - MARGIN.BOTTOM - MARGIN.TOP - 40, MARGIN.TOP + 10],
    round: true,
    domain,
  });

  const xScale = scaleBand<string>({
    range: [MARGIN.LEFT + 30, width],
    round: true,
    domain: Object.keys(binData),
    padding: 0.3,
  });

  const constrainedWidth = Math.min(40, xScale.bandwidth());

  return (
    <>

      <svg
        width={width}
        height={height}
      >
        <PatternLines
          id="hViolinLines"
          height={3}
          width={3}
          stroke="#ced4da"
          strokeWidth={1}
            // fill="rgba(0,0,0,0.3)"
          orientation={['horizontal']}
        />
        <Text verticalAnchor="start" textAnchor="middle" x={(width + MARGIN.LEFT) / 2 - 10} fontSize={20} fill="orangered">

          {title}
        </Text>
        <Group top={0} left={1}>
          {Object.keys(binData).map((binLabel) => (
            <>
              {saveGraphOptions.showViolin && (
              <ViolinPlot
                key={binLabel}
                left={xScale(binLabel)}
                data={binData[binLabel]}
                valueScale={yScale}
                width={constrainedWidth}
                stroke="#AAAAAA"
                fill="url(#hViolinLines)"
                fillOpacity={0.3}

              />

              )}

              <BoxPlot
                min={boxplot[binLabel].min}
                max={boxplot[binLabel].max}
                left={(xScale(binLabel) || 0) + 0.3 * constrainedWidth}
                firstQuartile={boxplot[binLabel].firstQuartile}
                thirdQuartile={boxplot[binLabel].thirdQuartile}
                median={boxplot[binLabel].median}
                boxWidth={constrainedWidth * 0.4}
                fill="#FFFFFF"
                fillOpacity={0.7}
                stroke="#FFFFFF"
                strokeWidth={5}
                valueScale={yScale}
                  // outliers={outliers(d)}
                minProps={{
                  onMouseOver: () => {
                    showTooltip({
                      tooltipTop: yScale(boxplot[binLabel].min) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        min: boxplot[binLabel].min,
                        name: binLabel,
                      },
                    });
                  },
                  onMouseLeave: () => {
                    hideTooltip();
                  },
                }}
                maxProps={{
                  onMouseOver: () => {
                    showTooltip({
                      tooltipTop: yScale(boxplot[binLabel].max) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        max: boxplot[binLabel].max,
                        name: binLabel,
                      },
                    });
                  },
                  onMouseLeave: () => {
                    hideTooltip();
                  },
                }}
                boxProps={{
                  onMouseOver: () => {
                    showTooltip({
                      tooltipTop: yScale(boxplot[binLabel].median) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        ...boxplot[binLabel],
                        name: binLabel,
                      },
                    });
                  },
                  onMouseLeave: () => {
                    hideTooltip();
                  },
                }}
                medianProps={{
                  style: {
                    stroke: 'white',
                  },
                  onMouseOver: () => {
                    showTooltip({
                      tooltipTop: yScale(boxplot[binLabel].median) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        median: boxplot[binLabel].median,
                        name: binLabel,
                      },
                    });
                  },
                  onMouseLeave: () => {
                    hideTooltip();
                  },
                }}
              />
            </>

          ))}
          <AxisBottom
            scale={xScale}
            label="CR Buckets"
            labelProps={{ fontSize: 17, fill: 'white', textAnchor: 'middle' }}
            stroke="#FFFFFF"
            tickFormat={(tick: string) => `${tick.replaceAll('.0', '')} (${boxplot[tick].count})`}
            top={height - MARGIN.TOP - MARGIN.BOTTOM - 20}
            numTicks={Object.keys(boxplot).length}
          >
            {(props) => {
              const tickLabelSize = 15;
              const tickRotate = -28;
              const tickColor = '#FFFFFF';
              const axisCenter = (props.axisToPoint.x - props.axisFromPoint.x) / 2;
              return (
                <g className="my-custom-bottom-axis">
                  <Line stroke="#FFFFFF" from={{ x: props.axisFromPoint.x - MARGIN.LEFT / 2, y: props.axisFromPoint.y }} to={props.axisToPoint} />
                  {props.ticks.map((tick) => {
                    const computedX = (xScale(tick.value) || 0) + constrainedWidth * 0.5;
                    // eslint-disable-next-line no-param-reassign
                    tick.to.x = computedX;
                    // eslint-disable-next-line no-param-reassign
                    tick.from.x = computedX;
                    const tickX = tick.to.x;
                    const tickY = tick.to.y + tickLabelSize + (props.tickLength ?? 10);
                    return (
                      <Group
                        key={`vx-tick-${tick.value}-${tick.index}`}
                        className="vx-axis-tick"
                        left={0}
                      >
                        <Line
                          from={tick.from}
                          to={tick.to}
                          stroke={tickColor}
                        />
                        <Line
                          to={tick.from}
                          from={{ x: tickX, y: -(height - MARGIN.TOP - MARGIN.BOTTOM - 50) }}
                          stroke="#AAAAAA"
                          opacity={0.5}
                        />
                        <text
                          transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                          fontSize={tickLabelSize}
                          textAnchor="middle"
                          fill={tickColor}
                        >
                          {tick.formattedValue}
                        </text>
                      </Group>
                    );
                  })}
                  <text
                    textAnchor="middle"
                    transform={`translate(${axisCenter}, 70)`}
                    fill="white"
                    fontSize="19"
                  >
                    {props.label}
                  </text>
                </g>
              );
            }}
          </AxisBottom>
        </Group>

        <AxisLeft
          left={MARGIN.LEFT}
          scale={yScale}
          stroke="#FFFFFF"
          label="Saves"
          labelProps={{ fontSize: 17, fill: 'white', textAnchor: 'middle' }}
          tickLabelProps={
            () => ({ fill: 'white', fontSize: 17, textAnchor: 'end' })
          }
        />

      </svg>

      {tooltipOpen && tooltipData && (
      <Tooltip
        top={tooltipTop}
        left={tooltipLeft}
        style={{ ...defaultTooltipStyles, backgroundColor: '#283238', color: 'white' }}
      >
        <div>
          <strong>{tooltipData.name}</strong>
        </div>
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          {tooltipData.max !== undefined && (
          <div>
            max:
            {' '}
            {tooltipData.max}
          </div>
          )}
          {tooltipData.thirdQuartile !== undefined && (
          <div>
            third quartile:
            {' '}
            {tooltipData.thirdQuartile}
          </div>
          )}
          {tooltipData.median !== undefined && (
          <div>
            median:
            {' '}
            {tooltipData.median}
          </div>
          )}
          {tooltipData.mean !== undefined && (
          <div>
            mean:
            {' '}
            {tooltipData.mean.toPrecision(3)}
          </div>
          )}
          {tooltipData.firstQuartile !== undefined && (
          <div>
            first quartile:
            {' '}
            {tooltipData.firstQuartile}
          </div>
          )}
          {tooltipData.min !== undefined && (
          <div>
            min:
            {' '}
            {tooltipData.min}
          </div>
          )}
        </div>
      </Tooltip>
      )}
    </>
  );
});
export default SaveGraphs;
