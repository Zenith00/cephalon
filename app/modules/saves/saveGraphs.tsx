import { getRandomNormal, getSeededRandom } from '@visx/mock-data';
// import genStats from '@visx/mock-data/lib/generators/genStats';
import type {
  SaveDatapack,
  SaveFilters,
  SaveGraphOptions,
  SaveTypes
} from '@pages/Saves';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { scaleBand, scaleLinear } from '@visx/scale';
import { BoxPlot, ViolinPlot } from '@visx/stats';
import { Text } from '@visx/text';
import { Tooltip, defaultStyles as defaultTooltipStyles, withTooltip } from '@visx/tooltip';
import type { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
// import Pluralize from 'pluralize';
import { Line } from '@visx/shape';
import pluralize from 'pluralize';
import React from 'react';

interface TooltipData {
  name?: string;
  min?: number;
  median?: number;
  max?: number;
  firstQuartile?: number;
  thirdQuartile?: number;
}

export type SaveGraphProps = {
  width: number;
  height: number;
   datapack: SaveDatapack,
  selectedSave: SaveTypes
  filters:SaveFilters
  saveGraphOptions: SaveGraphOptions
};

const SaveGraphs = withTooltip<SaveGraphProps, TooltipData>(({
  width,
  height,
  datapack,
  filters,
  saveGraphOptions,
  selectedSave,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  showTooltip,
  hideTooltip,
}: (SaveGraphProps & WithTooltipProvidedProps<TooltipData>)) => {
  const seededRandom = getSeededRandom(0.1);
  const randomNormal = getRandomNormal.source(getSeededRandom(0.789))(4, 3);
  // const data: Stats[] = genStats(5, randomNormal, () => 10 * seededRandom());
  // const allValues: number[] = [];

  const MARGIN = {
    BOTTOM: 30,
    TOP: 20,
    LEFT: 60,
  };
  const values = Object.values(datapack.saveData).map((d) => Object.values(d.boxplot).map((boxdata) => [boxdata.min, boxdata.max])).flat(2);
  const domain = saveGraphOptions.globalYAxis ? datapack.saveRange : [Math.min(...values), Math.max(...values)];
  const yScale = scaleLinear<number>({
    range: [height - MARGIN.BOTTOM - MARGIN.TOP - 40, MARGIN.TOP + 10],
    round: true,
    domain,
  });

  const xScale = scaleBand<string>({
    range: [MARGIN.LEFT + 30, width],
    round: true,
    domain: Object.keys(datapack.saveData.STR.binData),
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

          {`${selectedSave} Saving Throws of ${filters.creatureType === 'all' ? 'All Creatures' : pluralize(filters.creatureType[0].toUpperCase() + filters.creatureType.slice(1), datapack.typeCount, true)} by CR`}
        </Text>
        <Group top={0} left={1}>
          {Object.keys(datapack.saveData[selectedSave].binData).map((binLabel) => (
            <>
              {saveGraphOptions.showViolin && (
              <ViolinPlot
                key={selectedSave + binLabel}
                left={xScale(binLabel)}
                data={datapack.saveData[selectedSave].binData[binLabel]}
                valueScale={yScale}
                width={constrainedWidth}
                stroke="#AAAAAA"
                fill="url(#hViolinLines)"
                fillOpacity={0.3}

              />

              )}

              <BoxPlot
                min={datapack.saveData[selectedSave].boxplot[binLabel].min}
                max={datapack.saveData[selectedSave].boxplot[binLabel].max}
                left={(xScale(binLabel) || 0) + 0.3 * constrainedWidth}
                firstQuartile={datapack.saveData[selectedSave].boxplot[binLabel].firstQuartile}
                thirdQuartile={datapack.saveData[selectedSave].boxplot[binLabel].thirdQuartile}
                median={datapack.saveData[selectedSave].boxplot[binLabel].median}
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
                      tooltipTop: yScale(datapack.saveData[selectedSave].boxplot[binLabel].min) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        min: datapack.saveData[selectedSave].boxplot[binLabel].min,
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
                      tooltipTop: yScale(datapack.saveData[selectedSave].boxplot[binLabel].max) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        max: datapack.saveData[selectedSave].boxplot[binLabel].max,
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
                      tooltipTop: yScale(datapack.saveData[selectedSave].boxplot[binLabel].median) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        ...datapack.saveData[selectedSave].boxplot[binLabel],
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
                      tooltipTop: yScale(datapack.saveData[selectedSave].boxplot[binLabel].median) ?? 0 + 40,
                      tooltipLeft: xScale(binLabel)! + constrainedWidth + 5,
                      tooltipData: {
                        median: datapack.saveData[selectedSave].boxplot[binLabel].median,
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
            tickFormat={(tick: string) => `${tick.replaceAll('.0', '')} (${datapack.saveData[selectedSave].boxplot[tick].count})`}
            top={height - MARGIN.TOP - MARGIN.BOTTOM - 20}
            numTicks={Object.keys(datapack.saveData[selectedSave].boxplot).length}
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
