import { HeatmapRect } from '@visx/heatmap';
import React from 'react';
import { scaleLinear } from '@visx/scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Datapack } from '../pages/ConditionImmunities';


const ConditionImmunityGraph = (
  { width, height, datapack }: { width: number, height: number, datapack: Datapack }
) => {

  const margin = { top: 10, left: 80, right: 5, bottom: 120 };
  const lpad = 120; 
  const squareSize = Math.min(width, height);


  const xMax = squareSize > margin.left + margin.right ? squareSize - margin.left - margin.right : squareSize;
  const yMax = squareSize - margin.bottom - margin.top;

  const binWidth = xMax / (datapack['data']?.length || 1);
  const binHeight = yMax / (datapack?.['data']?.[0]?.['bins']?.length || 1);
  const colorBuffer = 0.1;
  const xScale = scaleLinear<number>({
    domain: [0, datapack['data']?.length || 1000]
  });
  const yScale = scaleLinear<number>({
    domain: [0, datapack?.['data']?.[0]?.['bins']?.length || 1000]
  });


  xScale.range([lpad, xMax]);
  yScale.range([yMax, 0]);


  return (
    <svg width={width} height={height}>
      <HeatmapRect
        data={datapack['data']}
        xScale={(d) => {
          return xScale(d) || 0;
        }}
        gap={2}
        yScale={(d) => yScale(d) ?? 0}
        binWidth={binWidth}
        binHeight={binHeight}
        colorScale={(x) => interpolateGnBu(((x.valueOf()) / 100) * (1.0 - colorBuffer) + colorBuffer)}
      >
        {(heatmap) =>
          heatmap.map((heatmapBins) =>
            heatmapBins.map((bin) => (
              <g key={`heatmap-g-${bin.row}-${bin.column}`}>
                <rect
                  key={`heatmap-rect-${bin.row}-${bin.column}`}
                  className='visx-heatmap-rect'
                  width={bin.width}
                  height={bin.height}
                  x={bin.x}
                  y={bin.y}
                  fill={bin.color}
                  fillOpacity={bin.opacity}
                  onClick={() => {
                  }}
                />

                <text key={`heatmap-text-${bin.row}-${bin.column}`}
                      x={bin.x + bin.height / 2} y={bin.y + bin.height / 2}
                      textAnchor={'middle'}
                      dominantBaseline={'middle'}
                      alignmentBaseline={'middle'}

                      fontFamily='Verdana'
                      fontSize={Math.round((binWidth * (2 / 8)))}
                      fill={(bin.count || 0) < 50 ? 'black' : 'white'}
                >{bin.count}%
                </text>
              </g>
            ))
          )
        }
      </HeatmapRect>

      <AxisLeft left={margin.left + 40}
                scale={yScale}
                tickFormat={(d) => datapack?.['row_labels']?.[d.valueOf()]}
                top={binWidth / 2}
                numTicks={datapack['data']?.[0]?.['bins']?.length}
                tickLabelProps={() => ({
                  fontSize: Math.round((binWidth * (2 / 8))) || 12,
                  textAnchor: 'end',
                  fontFamily: 'Veranda',
                  dy: (binWidth * (1 / 11)),
                  dx: -(binWidth * (1 / 20))

                })}

      />
      <AxisBottom
        top={yMax + margin.top + binHeight * (5 / 6)}

        scale={xScale}
        tickFormat={(d) => datapack?.['column_labels']?.[d.valueOf()]}
        numTicks={datapack['data']?.length}
        left={binWidth / 2}
        tickLabelProps={() => ({
          angle: -35,
          textAnchor: 'end',
          fontSize: Math.round((binWidth * (2 / 7))) || 12
        })}
        tickLineProps={{
          strokeWidth: 1
        }}

      />

    </svg>

  );
};

export default ConditionImmunityGraph;

