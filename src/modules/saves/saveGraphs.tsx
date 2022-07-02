import React, { useEffect, useState } from 'react';
import type { Filters } from '@pages/ConditionImmunities';
import { CREATURE_TYPES, SOURCES } from '@condition/constants';
import { getRandomNormal, getSeededRandom } from '@visx/mock-data';
import type { Stats } from '@visx/mock-data/lib/generators/genStats';
// import genStats from '@visx/mock-data/lib/generators/genStats';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useThrottledCallback } from 'use-debounce';
import queryString from 'query-string';
import { AppShell, Footer, Header } from '@mantine/core';
import BestiaryFilterNavbar from '@condition/BestiaryFilter.navbar';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { BoxPlot, ViolinPlot } from '@visx/stats';
import type {
  SaveDatapack, SaveData, SaveTypes, SaveGraphOptions, SaveFilters,
} from '@pages/Saves';
import { withTooltip, Tooltip, defaultStyles as defaultTooltipStyles } from '@visx/tooltip';
import type { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { Axis, AxisBottom, AxisLeft } from '@visx/axis';
import { PatternLines } from '@visx/pattern';

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
    BOTTOM: 11,
    TOP: 20,
    LEFT: 60,
  };
  const values = Object.values(datapack.saveData).map((d) => Object.values(d.boxplot).map((boxdata) => [boxdata.min, boxdata.max])).flat(2);
  const domain = saveGraphOptions.globalYAxis ? datapack.saveRange : [Math.min(...values), Math.max(...values)];
  const yScale = scaleLinear<number>({
    range: [height - MARGIN.BOTTOM - MARGIN.TOP - 40, 0],
    round: true,
    domain,
  });

  const xScale = scaleBand<string>({
    range: [MARGIN.LEFT, width],
    round: true,
    domain: Object.keys(datapack.saveData.STR.binData),
    padding: 0.4,
  });
  console.log(datapack);

  const constrainedWidth = Math.min(40, xScale.bandwidth());

  //
  // const [xScale, setXScale] = useState<ReturnType<typeof scaleBand<string>>>();
  //
  // const throttled = useThrottledCallback(() => {
  //   fetch(
  //     queryString.stringifyUrl(
  //       {
  //         url: 'https://arcane.cephalon.xyz/saves',
  //         query: filters,
  //       },
  //       { arrayFormat: 'comma' },
  //     ),
  //   )
  //     .then((res) => res.json())
  //     .then((d) => {
  //       setDatapack(d as Datapack);
  //       setXScale(scaleBand<string>({
  //         range: [0, width],
  //         round: true,
  //         domain: data.map((x) => x.boxPlot.x),
  //         padding: 0.4,
  //       }));
  //     }).catch((e) => console.error(e));
  // }, 500);

  // useEffect(() => {
  //   throttled();
  // }, [filters]);

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

          {`${selectedSave} Saving Throws of ${filters.creatureType[0].toUpperCase() + filters.creatureType.slice(1)}s by CR`}
        </Text>
        <Group top={0}>
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
                strokeWidth={2}
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

        </Group>
        <AxisBottom
          scale={xScale}
          label="CR Buckets"
          labelProps={{ fontSize: 17, fill: 'white', textAnchor: 'middle' }}
          stroke="#FFFFFF"
          tickFormat={(tick: string) => tick.replaceAll('.0', '')}
          top={height - MARGIN.TOP - MARGIN.BOTTOM - 20}
          left={(0.3 * constrainedWidth) - 18}
          tickLabelProps={
            () => ({ fill: 'white', fontSize: 17, textAnchor: 'middle' })
          }
          tickLineProps={{ style: { strokeWidth: 2, stroke: 'white' } }}
        />

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
          {tooltipData.max && (
          <div>
            max:
            {tooltipData.max}
          </div>
          )}
          {tooltipData.thirdQuartile && (
          <div>
            third quartile:
            {tooltipData.thirdQuartile}
          </div>
          )}
          {tooltipData.median && (
          <div>
            median:
            {tooltipData.median}
          </div>
          )}
          {tooltipData.firstQuartile && (
          <div>
            first quartile:
            {tooltipData.firstQuartile}
          </div>
          )}
          {tooltipData.min && (
          <div>
            min:
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
