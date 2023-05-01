import type { MouseEventHandler } from "react";
import React, {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useState,
} from "react";
import type { MantineTheme } from "@mantine/core";
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  MantineProvider,
  ActionIcon,
} from "@mantine/core";
import DamageCalculatorInput from "@/damage2/damageCalculator.component";
import { useForm } from "@mantine/form";
import DamageGraphSidebar from "@/damage2/graph.component";

import { useImmer } from "use-immer";
import { enableMapSet } from "immer";
import type { DamagePMFByAC } from "@/damage2/types";
import type { AC } from "@/damage/types";
import {
  LayoutSidebarRightCollapse,
  LayoutSidebarRightExpand,
} from "tabler-icons-react";
import { useToggle } from "@mantine/hooks";

enableMapSet();

type damagerFormValue = {
  label: string;
  attack: string;
  attackCount: number;
  damage: string;
  key: string;
  advantage: string;
  damageOnFirstHit: string;
  damageOnMiss: string;
  critFailFaceCount: number;
  critFaceCount: number;
};

type globalValues = {
  damage: string;
  attack: string;
};

export type formValue = {
  global: globalValues;
  damagers: damagerFormValue[];
};

export type DamageMetadata = {
  damagePMFByAC: DamagePMFByAC;
  averageDamageByAC: Map<AC, number>;
  label: string;
};

const Damage2 = () => {
  const [opened, setOpened] = useState(false);

  const [damageData, setDamageData] = useImmer<Record<string, DamageMetadata>>(
    {}
  );

  const [expandGraph, toggleExpandGraph] = useToggle([false, true]);
  const theme = useMantineTheme();

  const form = useForm<formValue>({
    initialValues: {
      global: {
        damage: "",
        attack: "",
      },
      damagers: [
        {
          label: "",
          attack: "",
          damage: "1d6",
          damageOnFirstHit: "",
          damageOnMiss: "",
          attackCount: 1,
          key: useId(),
          critFaceCount: 1,
          critFailFaceCount: 1,
          advantage: "0"
        },
      ],
    },
  });

  useEffect(() => {
    console.log({ damageData });
  }, [damageData]);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 100, lg: 200 }}
          >
            <Text>Application navbar</Text>
          </Navbar>
        }
        aside={
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Aside
              p="md"
              hiddenBreakpoint="md"
              style={{ width: expandGraph ? "100%" : "55%" }}
            >
              <ActionIcon
                style={{}}
                variant="filled"
                color="blue"
                onClick={() => toggleExpandGraph()}
              >
                {expandGraph ? (
                  <LayoutSidebarRightCollapse />
                ) : (
                  <LayoutSidebarRightExpand />
                )}
              </ActionIcon>
              <DamageGraphSidebar form={form} damageData={damageData} />
            </Aside>
          </MediaQuery>
        }
        footer={
          <Footer height={60} p="md">
            Application footer
          </Footer>
        }
        header={
          <Header height={{ base: 50, md: 70 }} p="md">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <Text>Application header</Text>
            </div>
          </Header>
        }
      >
        <Text>Resize app to see responsive navbar in action</Text>
        <DamageCalculatorInput form={form} setDamageData={setDamageData} />
      </AppShell>
    </MantineProvider>
  );
};

export default Damage2;
