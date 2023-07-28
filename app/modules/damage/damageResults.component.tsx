import { numberRange, ZERO, type PMF, weighted_mean_pmf } from "@/damage/math";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";

import React, { useEffect, useMemo } from "react";
import { GradientTealBlue } from "@visx/gradient";
import { Group } from "@visx/group";
import Fraction from "fraction.js";

import { useElementSize } from "@mantine/hooks";

const DamageResults = ({ pmf }: { pmf?: PMF  }) => {
  // scales, memoize for performance

  const { ref, width, height } = useElementSize();

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, width],
        round: true,
        domain: [0, 1],
      }),
    [width]
  );


  const yScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, height - 120],
        round: true,
        domain: numberRange(0, Math.max(...pmf?.keys() ?? [0])+1).sort((a, b) => a - b),
        padding: 0.4,
      }),
    [height, pmf]
  );

  // const yScale = useMemo(
  //   () =>
  //     scaleLinear<number>({
  //       range: [yMax, 0],
  //       round: true,
  //       domain: [0, Math.max(...data.map(getLetterFrequency))],
  //     }),
  //   [yMax],
  // );

  const verticalMargin = 0;

  return pmf ? (
    <div style={{ flexGrow: 1 }}>
      <svg width="100%" height="100%" ref={ref}>
        {/* <GradientTealBlue id="teal" /> */}
        <rect width="100%" height="100%" fill="url(#teal)" rx={14} />
        <text
          x={0}
          y={0}
          fill="black"
          fontSize={14}
          dx=".32em"
          fontWeight="bold"

          dy="1em"
          textAnchor="start"
        >
          D
        </text>
        <text
          x={width - 25}
          y={0}
          fill="black"
          fontSize={14}
          dx=".32em"
          fontWeight="bold"

          dy="1em"
          textAnchor="end"
        >
          Outcomes
        </text>
        <text
          x={20}
          y={0}
          fill="black"
          fontWeight="bold"
          fontSize={14}
          dx=".32em"
          dy="1em"
          textAnchor="left"
        >
          Chance
        </text>

        <text
          x={20}
          y={height-120}
          fill="black"
          fontWeight="bold"
          fontSize={14}
          dx=".32em"
          dy="1em"
          textAnchor="left"
        >
          Weighted Mean: {weighted_mean_pmf(pmf).toString()}
        </text>
        <Group top={verticalMargin / 2}>
          {numberRange(0, Math.max(...pmf.keys())+1).map((k) => {
            const prob = pmf.get(k) ?? ZERO;
            const v = k;
            //   const letter = getLetter(d);
            // const barWidth = xScale.bandwidth();
            // const barHeight = yMax - (yScale(getLetterFrequency(d)) ?? 0);

            // const barX = xScale(letter);
            const barX = 0;
            // const barY = yMax - barHeight;
            const probF = new Fraction(prob);
            const barY = yScale(v);
            const barWidth = xScale(probF.valueOf());
            const barHeight = yScale.bandwidth();
            return (
              <Group key={`barGroup-${k}`}>
                <Bar
                  key={`bar-${v}`}
                  x={25}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="rgba(23, 233, 217, .5)"
                  onClick={() => {
                    // alert(`clicked: ${JSON.stringify(Object.values(d))}`);
                  }}
                />
                <text
                  x={5}
                  y={barY}
                  fill="black"
                  fontSize={14}
                  dx=".32em"
                  dy="1em"
                  textAnchor="middle"
                >
                  {v.toString(7)}
                </text>
                <text
                  x={width - 25}
                  y={barY}
                  fill="black"
                  fontSize={14}
                  dx=".32em"
                  dy="1em"
                  textAnchor="end"
                >
                  {probF.toFraction()}
                </text>
                <text
                  x={25}
                  y={barY}
                  fill="black"
                  fontSize={14}
                  dx=".32em"
                  dy="1em"
                  textAnchor="left"
                >
                  {probF.toString()}
                </text>
              </Group>
            );
          })}
        </Group>
      </svg>
    </div>
  ) : (
    <div />
  );
};

export default DamageResults;
