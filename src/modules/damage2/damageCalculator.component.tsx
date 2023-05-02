import {
  Accordion,
  Box,
  Code,
  Flex,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { DamageMetadata, formValue } from "@pages/Damage2";
import { IconAdjustmentsCog } from "@tabler/icons-react";
import React from "react";
import type { Updater } from "use-immer";
import workerpool from "workerpool";
import { parseDiceStrings, weighted_mean_pmf } from "@utils/math";
import { type DamageInfo } from "./mathWorker";
import type { DamagePMFByAC } from "./types";

const pool = workerpool.pool("/mathWorker.js");

const DamageCalculatorInput = ({
  form,
  setDamageData,
}: {
  form: UseFormReturnType<formValue>;
  setDamageData: Updater<Record<string, DamageMetadata>>;
}) => {
  const extractDamageMetadata = (formValues: formValue): DamageInfo[] =>
    formValues.damagers.map((damager) => ({
      damage: [damager.damage, formValues.global.damage].filter((x) => x),
      attack: [damager.attack, formValues.global.attack].filter((x) => x),
      damageOnMiss: damager.damageOnMiss,
      damageOnFirstHit: damager.damageOnFirstHit,
      attackCount: Number(damager.attackCount),
      critFaceCount: damager.critFaceCount,
      critFailFaceCount: damager.critFailFaceCount,
      advantage: Number(damager.advantage),
      key: damager.key,
    }));

  React.useEffect(() => {
    pool
      .exec("computeDamageInfo", extractDamageMetadata(form.values))
      .then(
        ({
          damagePMFByAC,
          damagerMetadata,
        }: {
          damagePMFByAC: DamagePMFByAC;
          damagerMetadata: DamageInfo;
        }) => {
          setDamageData((draft) => {
            const averageDamageByAC = new Map(
              [...damagePMFByAC.entries()].map(([k, v]) => [
                k,
                weighted_mean_pmf(v).round(8).valueOf(),
              ])
            );
            draft[damagerMetadata.key] = {
              ...draft[damagerMetadata.key],
              damagePMFByAC,
              averageDamageByAC,
            };
          });
        }
      )
      .catch((err) => {
        console.log(err);
      });
  }, [form.values, setDamageData]);

  // React.useEffect(() => {
  //   console.log("PDS");
  //   console.log(parseDiceStrings({diceStrings: [ "1d20", form.values.damagers[0].attack]}));
  // }, [form.values]);

  return (
    <Box>
      <Paper maw={320} mr="auto" my="sm" p="sm" shadow="sm">
        <TextInput
          label="Global Damage Bonus"
          placeholder="Last name"
          mt="s"
          size="s"
          {...form.getInputProps("global.damage")}
        />
        <TextInput
          label="Global Attack Bonus"
          placeholder="Last name"
          mt="s"
          size="s"
          {...form.getInputProps("global.attack")}
        />
      </Paper>
      {form.values.damagers.map((item, index) => (
        <Group key={item.key} mt="xs">
          <Paper maw={320} p="sm" my="sm" mr="auto" shadow="sm">
            <Accordion defaultValue={["basic"]} multiple>
              <Accordion.Item value="basic">
                <Accordion.Control>Basic</Accordion.Control>
                <Accordion.Panel>
                  <TextInput
                    label="Label"
                    placeholder="Label"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.label`)}
                  />
                  <TextInput
                    label="Damage"
                    placeholder="1d12"
                    mt="s"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.damage`)}
                  />
                  <TextInput
                    label="Attack Modifiers"
                    placeholder="1d4"
                    mt="s"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.attack`)}
                  />
                  <NumberInput
                    label="Attack Count"
                    placeholder="1"
                    {...form.getInputProps(`damagers.${index}.attackCount`)}
                    styles={{input: {height: "1.75rem", minHeight:"1.75rem"}}}
                  />
                  <Select
                    size="sm"
                    label="Advantage"
                    defaultValue="0"
                    styles={{input: {height: "1.75rem", minHeight:"1.75rem"}}}
                    data={[
                      { label: "Disadv+", value: "-2" },
                      { label: "Disadv", value: "-1" },
                      { label: "Normal", value: "0" },
                      { label: "Adv", value: "1" },
                      { label: "Adv+ (Elven Accuracy)", value: "2" },
                    ]}
                    {...form.getInputProps(`damagers.${index}.advantage`)}
                  />
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="conditional">
                <Accordion.Control>Conditional</Accordion.Control>
                <Accordion.Panel>
                  <TextInput
                    label="Damage on miss"
                    placeholder="Label"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.damageOnMiss`)}
                  />
                  <TextInput
                    label="Damage on first hit"
                    placeholder=""
                    mt="s"
                    size="s"
                    {...form.getInputProps(
                      `damagers.${index}.damageOnFirstHit`
                    )}
                  />
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="playerstats">
                <Accordion.Control>Player Stats</Accordion.Control>
                <Accordion.Panel>
                  <NumberInput
                    label="Crit Faces"
                    placeholder="1"
                    {...form.getInputProps(`damagers.${index}.critFaceCount`)}
                  />
                  <NumberInput
                    label="Crit Fail Faces"
                    placeholder="1"
                    {...form.getInputProps(
                      `damagers.${index}.critFailFaceCount`
                    )}
                  />
                </Accordion.Panel>
              </Accordion.Item>
              {/* <Text size="sm" weight={500} mt="xl">
              Form values:
            </Text> */}
            </Accordion>
          </Paper>
        </Group>
      ))}
    </Box>
  );
};

export default DamageCalculatorInput;
