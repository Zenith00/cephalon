import React, { useEffect } from "react";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  XYChart,
} from "@visx/xychart";
import { Aside, Title } from "@mantine/core";

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
  xAccessor: (d) => d.x,
  yAccessor: (d) => d.y,
};

// const target_ac = 16;
// const bonus_to_hit = 0;
const s = (l: number[]) => l.reduce((a, b) => a + b, 0);

const DamageGraphs = ({
  target_ac,
  to_hit_bonus,
}: {
  target_ac: number;
  to_hit_bonus: number;
}) => {
  useEffect(() => {
    return () => {
      const table = Array.from({ length: 20 }, (x, i) => i + 1).map((d20) => {
        return Array.from({ length: 8 }, (x, i) => i + 1).map(
          (d8) =>
            ((d20 != 1 &&
              d20 + d8 + to_hit_bonus >= target_ac &&
              d20 < target_ac) ||
              d20 == 20) as any as number
        );
      });
      console.log(table);
      let improvementFactors = Array.from({ length: 20 }, (x, i) => i).map(
        (threshold_gte) => {
          const improvedCases = s(
            table.slice(0, threshold_gte).map((pa_cases) => s(pa_cases))
          );
          return improvedCases * (20 - threshold_gte);
        }
      );
      console.log(improvementFactors);
    };
  }, [target_ac, to_hit_bonus]);

  return (
    <Aside width={{ sm: 400, md: 500, lg: 700 }}>
      <div>
        <XYChart
          height={300}
          xScale={{ type: "band" }}
          yScale={{ type: "linear" }}
        >
          <AnimatedAxis orientation="bottom" />
          <AnimatedGrid columns={false} numTicks={4} />
          <AnimatedLineSeries dataKey="Line 1" data={data1} {...accessors} />
          <AnimatedLineSeries dataKey="Line 2" data={data2} {...accessors} />
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
