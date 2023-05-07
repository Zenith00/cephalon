import { PMF } from "@utils/math";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from '@visx/scale';

import React from "react";

 const DamageResults = ({pmf}: {pmf: PMF}) => {
      // scales, memoize for performance

      
  const xScale = 
    // () =>scaleBand<string>({
    //     range: [0, 1],
    //     round: true,
    //     domain: data.map(getLetter),
    //     padding: 0.4,
    //   }),

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map(getLetterFrequency))],
      }),
    [yMax],
  );


    <svg width={width} height={height}>
      <GradientTealBlue id="teal" />
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group top={verticalMargin / 2}>
        {[...pmf.entries()].map(([v, prob]) => {
        //   const letter = getLetter(d);
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(getLetterFrequency(d)) ?? 0);
          const barX = xScale(letter);
          const barY = yMax - barHeight;


          return (
            <Bar
              key={`bar-${letter}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="rgba(23, 233, 217, .5)"
              onClick={() => {
                if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
              }}
            />
          );
        })}
      </Group>
    </svg>;

};

export default DamageResults;