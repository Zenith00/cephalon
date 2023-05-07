import React, { useState } from "react";

import type { UseFormReturnType } from "@mantine/form";
import type { DamageMetadata, formValue } from "@pages/Damage2";
import workerpool from "workerpool";
import {
  ActionIcon,
  Button,
  Center,
  Chip,
  Container,
  Flex,
  Menu,
  Paper,
  SegmentedControl,
  Switch,
  Table,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useId } from "@mantine/hooks";

import type { TooltipData } from "@visx/xychart";
import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedGrid,
  AnimatedLineSeries,
  XYChart,
  Tooltip,
} from "@visx/xychart";
import { numberRange, weighted_mean_pmf } from "@utils/math";
import type { AC } from "@/damage/types";

import { schemeSet2, schemeTableau10 } from "d3-scale-chromatic";
import { Menu2 } from "tabler-icons-react";
import { ACs } from "@/damage/constants";
import { GradientTealBlue } from "@visx/gradient";
import { Group } from "@visx/group";

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
}: {
  form: UseFormReturnType<formValue>;
  damageData: Record<string, DamageMetadata>;
}) => {
  const theme = useMantineTheme();

  const stroke = theme.colorScheme === "dark" ? "white" : "black";
  const graphs: Graph[] = [
    { key: "1", damagerKeys: [Object.keys(damageData)[0]] },
  ];

  const [mode, setMode] = useState<MODE>("graph");

  const [opened, setOpened] = useState<Record<string, boolean>>({});

  return (
    <div
      onClick={() =>
        setOpened(
          Object.fromEntries([...Object.keys(opened)].map((k) => [k, false]))
        )
      }
    >
      {graphs.map((graph) => (
        <Paper key={graph.key}>
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
          {
            {
              table: (
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
                        <th key={r}>{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {graph.damagerKeys.map((damagerKey) => (
                      <tr key={`row-${damagerKey}`}>
                        <td
                          style={{
                            position: "sticky",
                            left: 0,
                            backgroundColor: "white",
                          }}
                        >
                          {
                            form.values.damagers.find(
                              (d) => d.key.toString() === damagerKey
                            )?.label
                          }
                        </td>
                        {ACs.map((r) => (
                          <td key={`${damagerKey}-${r}`}>
                            {damageData[damagerKey]?.averageDamageByAC.get(r)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ),
              graph: (
                <div>
                  <XYChart
                    height={300}
                    xScale={{ type: "band" }}
                    yScale={{ type: "linear" }}
                    margin={{ left: 25, right: 0, top: 5, bottom: 20 }}
                  >
                    {graph.damagerKeys.map((damagerKey, i) => (
                      <AnimatedLineSeries
                        dataKey={damagerKey}
                        key={`${graph.key}-${damagerKey}-ALS`}
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
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
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
                                {
                                  form.values.damagers.find(
                                    (d) =>
                                      d.key.toString() ===
                                      tooltipData.nearestDatum?.key
                                  )?.label
                                }
                                :{" "}
                                {accessors.yAccessor(
                                  tooltipData.nearestDatum.datum as datum
                                )}
                              </div>
                            </div>
                          );
                        }
                        return <div />;
                      }}
                    />
                  </XYChart>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon
                        style={{
                          position: "absolute",
                          right: "5px",
                          top: "5px",
                        }}
                        variant="filled"
                        color="blue"
                        // setOpened({...opened, [graph.key]: !opened[graph.key]})
                      >
                        <Menu2 />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {graph.damagerKeys.map((damagerKey) => (
                        <Menu.Item
                          key={`dropdown-${graph.key}-${damagerKey}`}

                        >
                          <Switch
                            label={
                              form.values.damagers.find(
                                (d) => d.key.toString() === damagerKey
                              )?.label || damagerKey
                            }
                            onClickCapture={(e) => {
                              console.log("switch!");
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                          />
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </div>
              ),
            }[mode]
          }
        </Paper>
      ))}
    </div>
  );
};

export default DamageGraphSidebar;
