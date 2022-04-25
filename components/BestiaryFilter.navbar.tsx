import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Box,
  Chip,
  Chips,
  Navbar,
  RangeSlider,
  ScrollArea,
  Title,
  Collapse,
  Button,
  MultiSelect,
} from "@mantine/core";
import {
  CREATURE_TYPES,
  SOURCES,
  Filters,
  Datapack,
} from "../pages/ConditionImmunities";

const BestiaryFilterNavbar = ({
  hidden,
  setFilters,
  filters,
  counts,
}: {
  hidden: boolean;
  setFilters: Dispatch<SetStateAction<Filters>>;
  filters: Filters;
  counts: Datapack["typeCounts"];
}) => {
  const [showTypeChips, setShowTypeChips] = useState(false);
  const [showSourceSelect, setShowSourceSelect] = useState(false);
  return (
    <Navbar
      p={"xs"}
      width={{ sm: 200, md: 250, lg: 300 }}
      hidden={hidden}
      hiddenBreakpoint={"sm"}
    >
      <Navbar.Section mt={"xs"} grow component={ScrollArea}>
        <Title order={2}>Creature Filters</Title>
        Showing a total of {counts.all} creatures.
        <Title order={2}>CR</Title>
        <RangeSlider
          max={30}
          min={0}
          minRange={1}
          defaultValue={[0, 30]}
          onChange={(v) => setFilters({ ...filters, crInclude: v })}
          style={{ marginTop: 20, marginBottom: 5, marginRight: 10 }}
          marks={[
            { value: 0, label: "0" },
            { value: 10, label: "10" },
            { value: 20, label: "20" },

            { value: 30, label: "30" },
          ]}
        />
        <Box pt={"md"} pb={"xs"}>
          <Title order={2}>
            <Button onClick={() => setShowTypeChips(!showTypeChips)}>
              Creature Types
            </Button>
          </Title>
        </Box>
        <Collapse in={showTypeChips}>
          <Chips
            multiple={true}
            defaultValue={[...CREATURE_TYPES]}
            direction={"column"}
            value={filters.creatureTypeInclude as any as string[]}
            onChange={(v) =>
              setFilters({
                ...filters,
                creatureTypeInclude:
                  v as any as typeof filters.creatureTypeInclude,
              })
            }
          >
            {CREATURE_TYPES.map((c) => (
              <Chip value={c} key={c}>
                {c.charAt(0).toUpperCase() + c.substring(1)} ({counts[c]})
              </Chip>
            ))}
          </Chips>
        </Collapse>
        <Box pt={"md"}>
          <Title order={2}>
            <Button onClick={() => setShowSourceSelect(!showSourceSelect)}>
              Sources
            </Button>
          </Title>
        </Box>
        <Collapse in={showSourceSelect}>
          <Box py={"md"}>
            <MultiSelect
              data={SOURCES as any as string[]}
              value={filters.sources as any as string[]}
              onChange={(v) =>
                setFilters({
                  ...filters,
                  sources: v as any as typeof filters.sources,
                })
              }
            ></MultiSelect>
          </Box>
        </Collapse>
      </Navbar.Section>
      x{" "}
    </Navbar>
  );
};

export default BestiaryFilterNavbar;
