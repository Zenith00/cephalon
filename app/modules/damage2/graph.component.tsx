import React, { useEffect, useState } from "react";

import {
  Button,
  Center,
  SegmentedControl,
  Stack,
  Table,
  useMantineTheme
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import { weighted_mean_pmf } from "~/modules/damage2/math";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart";

import DamageResults from "./damageResults.component";
import type { AC} from "./types";
import { ACs } from "./types";
import type { DamageMetadata, formValue } from "./mathUtils";

type datum = {
  x: AC;
  y: number;
};

const accessors = {
  xAccessor: (d: datum) => d.x,
  yAccessor: (d: datum) => d.y,
};

type Graph = {
  damagerKeys: string[];
  key: string;
};

// const data = [
//   ...(damageData[damager.key]?.damagePMFByAC.entries() ?? []),
// ].map(([ac, damagePMF]) => ({
//   x: ac,
//   y: weighted_mean_pmf(damagePMF).valueOf(),
// }));

const extractDataFromMetadata = (damageMetadata: DamageMetadata): datum[] =>
  [...(damageMetadata?.damagePMFByAC?.entries() ?? [])].map(
    ([ac, damagePMF]) => ({
      x: ac,
      y: weighted_mean_pmf(damagePMF).valueOf(),
    })
  );

type MODE = "graph" | "table";

const DamageGraphSidebar = ({
  form,
  damageData,
  shownDamagers,
}: {
  form: UseFormReturnType<formValue>;
  damageData: Record<string, DamageMetadata>;
  shownDamagers: string[];
}) => {
  const theme = useMantineTheme();

  const stroke = theme.colorScheme === "dark" ? "white" : "black";
  // const graphs: Graph =
  //   { key: "1", damagerKeys: [Object.keys(damageData)[0]] },

  const [mode, setMode] = useState<MODE>("graph");

  const [focus, setFocus] = useState<[keyof typeof damageData, AC]>();
  const [opened, setOpened] = useState<Record<string, boolean>>({});


  return (
    <Stack style={{ height: "100%" }}>
      <Center>
        <SegmentedControl
          value={mode}
          onChange={setMode as (value: string) => void}
          defaultValue="graph"
          size="sm"
          data={[
            { value: "graph", label: "Graph" },
            { value: "table", label: "Table" },
          ]}
        />
      </Center>
      {...{
        table: [
          <Table
            style={{ overflowX: "scroll", display: "inline-block" }}
            horizontalSpacing="sm"
            striped
            highlightOnHover
            withColumnBorders
          >
            <thead>
              <tr key="header">
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ textAlign: "right" }}> AC </div>
                  <div> Name</div>
                </th>
                {ACs.map((r) => (
                  <th
                    key={r}
                    style={{
                      paddingLeft: "5px",
                      paddingRight: "5px",
                      textAlign: "center",
                    }}
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shownDamagers.map((damagerKey) => (
                <tr key={`row-${damagerKey}`}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    }}
                  >
                    {damageData[damagerKey]?.label ?? damagerKey}
                  </td>
                  {ACs.map((r) => (
                    <td
                      key={`${damagerKey}-${r}`}
                      style={{ paddingLeft: "5px", paddingRight: "5px" }}
                    >
                      <Button
                        onClick={() => setFocus([damagerKey, r])}
                        compact
                        variant="light"
                      >
                        {damageData[damagerKey]?.averageDamageByAC.get(r)}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>,
          focus ? (
            <DamageResults
              pmf={damageData[focus[0]].damagePMFByAC.get(focus[1])}
            />
          ) : (
            <div />
          ),
        ],
        graph: [
          <div>
            <XYChart
              height={300}
              xScale={{ type: "band" }}
              yScale={{ type: "linear" }}
              margin={{ left: 25, right: 0, top: 5, bottom: 20 }}
            >
              {shownDamagers.map((damagerKey) => (
                <AnimatedLineSeries
                  dataKey={damagerKey}
                  key={`${damagerKey}-ALS`}
                  data={extractDataFromMetadata(damageData[damagerKey])}
                  {...accessors}
                />
              ))}

              <AnimatedAxis
                orientation="bottom"
                label="AC"
                hideTicks={false}
                numTicks={30}
                tickLength={5}
                tickStroke={stroke}
                tickLabelProps={() => ({
                  fill: stroke,
                })}
                tickTransform="translate(0,-1)"
                labelProps={{ fill: stroke }}
                labelOffset={20}
              />
              <AnimatedAxis
                orientation="left"
                label="Average Damage"
                hideTicks={false}
                hideZero={false}
                tickStroke={stroke}
                tickLabelProps={() => ({
                  fill: stroke,
                })}
                labelProps={{ fill: stroke }}
                labelOffset={35}
              />
              <AnimatedGrid columns={false} numTicks={4} />

              <Tooltip
                snapTooltipToDatumX
                snapTooltipToDatumY
                showVerticalCrosshair
                showSeriesGlyphs
                applyPositionStyle
                detectBounds
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  zIndex: 100,
                }}
                renderTooltip={({ tooltipData, colorScale }) => {
                  if (
                    tooltipData &&
                    colorScale &&
                    tooltipData.nearestDatum &&
                    tooltipData.nearestDatum.datum
                  ) {
                    return (
                      <div>
                        AC:{" "}
                        {accessors.xAccessor(
                          tooltipData.nearestDatum.datum as datum
                        )}
                        <div
                          style={{
                            color: "theme",
                          }}
                        >
                          {shownDamagers.map((d) => (
                            <div key={`tooltip-${d}`}>
                              {`${damageData[d].label} : ${
                                damageData[d].averageDamageByAC.get(
                                  (tooltipData.nearestDatum?.datum as datum).x as number
                                ) ?? ""
                              }`}
                              <br />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return <div />;
                }}
              />
            </XYChart>
          </div>,
        ],
      }[mode]}
    </Stack>
  );
};

export default DamageGraphSidebar;
