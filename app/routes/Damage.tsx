import DamageCalculatorInput from "@/damage2/damageCalculator.component";
import DamageGraphSidebar from "@/damage2/graph.component";
import {
  ActionIcon,
  AppShell,
  Aside,
  Burger,
  Button,
  Footer,
  Header,
  MantineProvider,
  MediaQuery,
  Navbar,
  Popover,
  Switch,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";

import type { DamageMetadata, formValue } from "@/damage2/math";
import { getEmptyDamager } from "@/damage2/math";
import { useToggle } from "@mantine/hooks";
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconMenu2,
} from "@tabler/icons-react";
import { enableMapSet } from "immer";
import { useImmer } from "use-immer";

enableMapSet();

export const FOOTER_HEIGHT = 60;
const Damage2 = () => {

  const [damageData, setDamageData] = useImmer<Record<string, DamageMetadata>>(
    {}
  );

  const [expandGraph, toggleExpandGraph] = useToggle([false, true]);
  const theme = useMantineTheme();

  const [hiddenDamagers, setHiddenDamagers] = useImmer<Record<string, boolean>>(
    {}
  );

  const form = useForm<formValue>({
    initialValues: {
      global: {
        damage: "",
        attack: "",
      },
      damagers: [getEmptyDamager([])],
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
        // navbar={
        //   // <Navbar
        //   //   p="md"
        //   //   hiddenBreakpoint="sm"
        //   //   hidden={!opened}
        //   //   width={{ sm: 100, lg: 200 }}
        //   // >
        //   //   <Text>Application navbar</Text>
        //   // </Navbar>
        // }
        aside={
          <MediaQuery smallerThan="md" styles={expandGraph ? {  } : {display: "none"}}>
            <Aside
              p="md"
              hiddenBreakpoint="md"
              style={{ width: (expandGraph) ? "100%" : "55%" }}
            >
                        <MediaQuery smallerThan="md" styles={expandGraph ?  {display: "none"} : {}}>

              <ActionIcon
                style={{}}
                variant="filled"
                color="blue"
                onClick={() => toggleExpandGraph()}
              >
                {expandGraph ? (
                  <IconLayoutSidebarRightCollapse />
                ) : (
                  <IconLayoutSidebarRightExpand />
                )}
              </ActionIcon>
              </MediaQuery>
              <Popover shadow="md" width={200}>
                <Popover.Target>
                  <Button
                    style={{
                      position: "absolute",
                      right: "5px",
                      top: "5px",
                    }}
                    variant="filled"
                    color="blue"
                    leftIcon={<IconMenu2 />}
                    compact

                    // setOpened({...opened, [graph.key]: !opened[graph.key]})
                  >
                    Hide Damagers
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  {[...(Object.entries(damageData) || [])].map(
                    ([damagerKey, damagerValue]) => (
                      <Switch
                        label={damagerValue.label || damagerKey}
                        onChange={(e) =>
                          setHiddenDamagers((draft) => {
                            draft[damagerKey] = e.currentTarget?.checked;
                          })
                        }
                        key={`switch-damagerkey-${damagerKey}`}
                        checked={hiddenDamagers[damagerKey]}
                      />
                    )
                  )}
                </Popover.Dropdown>
              </Popover>
              <DamageGraphSidebar
                form={form}
                damageData={damageData}
                shownDamagers={Object.keys(damageData).filter(
                  (x) => !hiddenDamagers[x]
                )}
              />
            </Aside>
          </MediaQuery>
        }
        footer={
          <Footer height={FOOTER_HEIGHT} p="md">
            Application footer
          </Footer>
        }
        header={
          <Header height={{ base: 50, md: 70 }} p="md">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="md" styles={{ display: "none" }}>
              <ActionIcon
                style={{}}
                variant="filled"
                color="blue"
                onClick={() => toggleExpandGraph()}
              >
                {expandGraph ? (
                  <IconLayoutSidebarRightCollapse />
                ) : (
                  <IconLayoutSidebarRightExpand />
                )}
              </ActionIcon>
              </MediaQuery>

              <Text style={{marginLeft: "1rem"}}> Damage Calculator v2</Text>
            </div>
          </Header>
        }
      >
        <Text></Text>
        <DamageCalculatorInput form={form} setDamageData={setDamageData} />
      </AppShell>
    </MantineProvider>
  );
};

export default Damage2;
