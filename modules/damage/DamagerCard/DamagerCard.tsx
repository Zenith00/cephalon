import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  MultiSelect,
  NumberInput,
  Paper,
  Popover,
  SelectItem,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { Damager } from "./PlayerCard";
import { Copy, InfoCircle, Settings, Trash } from "tabler-icons-react";
import { useDebouncedCallback } from "use-debounce";
import {
  DamageDataContext,
  DispatchPlayerList,
  InitialPlayerListContext,
  Target,
} from "@pages/Damage";

export type critType = "none" | "normal" | "maximized";

const DamagerCard = ({
  target,
  damager,
  playerKey,
}: {
  target: Target;
  damager: Damager;
  playerKey: number;
}) => {
  const [value, toggle] = useToggle("Attack", ["Attack", "Save"]);

  const [atkModId, setAtkModId] = useState(3);

  const getAtkModID = () => {
    let i = atkModId;
    setAtkModId(i + 1);
    return (i + 1).toString();
  };

  const dispatchPlayerList = useContext(DispatchPlayerList)!;
  const damageContext = useContext(DamageDataContext)!;
  const initialPlayerList = useContext(InitialPlayerListContext)!;

  //region [[Form Meta]]
  const [settingsPopover, setSettingsPopover] = useState(false);
  const [attackModPlaceholder, setAttackModPlaceholder] = useState("");
  const [attackModError, setAttackModError] = useState(false);
  //endregion

  //region [[FormState]]
  const [attackModOptions, setAttackModOptions] = useState<SelectItem[]>(
    damager.modifierOptions
  );
  const [attackModSelected, setAttackModSelected] = useState<string[]>(
    damager.modifierRaws
  );
  const [attackModParsed, setAttackModParsed] = useState<string[]>([]);
  const [damagerName, setDamagerName] = useState(damager.name);
  const [damagerDamage, setDamagerDamage] = useState(damager.damage);
  const [damagerCount, setDamagerCount] = useState(damager.count);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showDisadvantage, setShowDisadvantage] = useState(false);
  //endregion

  const modRegex = /^[^\[]*\[?(([+-]?((\d+d)?\d+))]?)$/;

  const debouncedDispatchPlayerList = useDebouncedCallback(
    dispatchPlayerList,
    500
  );

  useEffect(() => {
    debouncedDispatchPlayerList({
      field: "UPDATE_DAMAGER",
      playerKey,
      damagerKey: damager.key,
      newDamager: {
        ...damager,
        name: damagerName,
        damage: damagerDamage,
        count: damagerCount,
        modifiers: attackModParsed,
        modifierOptions: attackModOptions,
        modifierRaws: attackModSelected,
        advantageShow: new Map([
          ["advantage", showAdvantage],
          ["normal", showNeutral],
          ["disadvantage", showDisadvantage],
        ]),
      },
    });
  }, [
    damagerDamage,
    damagerName,
    damagerCount,
    showAdvantage,
    showDisadvantage,
    showNeutral,
    attackModParsed,
    attackModSelected,
    attackModOptions,
  ]);

  useEffect(() => {
    setAttackModParsed(
      attackModSelected.map(
        (modV) =>
          attackModOptions
            .find((option) => option.value! === modV)!
            .label!.match(modRegex)![2]
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackModSelected]);

  // useEffect(() => {
  //   if (!initialPlayerList?.[playerKey]?.damagers?.[damager.key]) {
  //     return;
  //   }
  //   setShowAdvantage(
  //     initialPlayerList[playerKey].damagers[damager.key].advantageShow.get(
  //       "advantage"
  //     )!
  //   );
  //   setShowDisadvantage(
  //     initialPlayerList[playerKey].damagers[damager.key].advantageShow.get(
  //       "disadvantage"
  //     )!
  //   );
  //   setShowNeutral(
  //     initialPlayerList[playerKey].damagers[damager.key].advantageShow.get(
  //       "normal"
  //     )!
  //   );
  //   setDamagerDamage(initialPlayerList[playerKey].damagers[damager.key].damage);
  //   setDamagerName(initialPlayerList[playerKey].damagers[damager.key].name);
  //   setAttackModOptions(
  //     initialPlayerList[playerKey].damagers[damager.key].modifierOptions
  //   );
  //   setAttackModSelected(
  //     initialPlayerList[playerKey].damagers[damager.key].modifierRaws
  //   );
  //   onUpdateAttackMods(
  //     initialPlayerList[playerKey].damagers[damager.key].modifierRaws,
  //     initialPlayerList[playerKey].damagers[damager.key].modifierOptions
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [initialPlayerList]);

  const onUpdateAttackMods = (
    newAttackModRawVals: string[],
    overrideAttackOptions?: SelectItem[]
  ) => {
    let originalAttackOptions = overrideAttackOptions || attackModOptions;
    let newAttackOptions = [...originalAttackOptions];

    const newAttackModIDs = newAttackModRawVals
      .map((mod) => {
        if (!mod.match(modRegex)) {
          return;
        }
        if (originalAttackOptions.map((x) => x.value).includes(mod)) {
          return mod;
        } else {
          const newId = getAtkModID();
          let newOption = {
            label: mod,
            value: newId,
          };
          newAttackOptions = [...originalAttackOptions, newOption];
          return newId;
        }
      })
      .filter((x) => x) as string[];

    let seenLabels = new Set();
    let attackModOptionsDeduped = newAttackOptions.filter((v) => {
      if (newAttackModIDs.includes(v.value)) {
        return true;
      } else {
        if (!seenLabels.has(v.label)) {
          seenLabels.add(v.label);
          return true;
        }
        return false;
      }
    });

    setAttackModOptions(
      attackModOptionsDeduped.sort((a, b) => a.label!.localeCompare(b.label!))
    );
    setAttackModSelected(newAttackModIDs);
  };

  return (
    // sx={{ maxWidth: 320 }}
    <Paper shadow={"xs"} p={"md"} mt={"md"} withBorder>
      <Box mx="auto">
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <TextInput
            label={`Name: ${damager.key}`}
            placeholder="Eldritch Blast"
            value={damagerName}
            style={{ width: "100%" }}
            onChange={(ev) => setDamagerName(ev.currentTarget.value)}
          />
          <Popover
            opened={settingsPopover}
            onClose={() => setSettingsPopover(false)}
            position={"right"}
            withArrow
            target={
              <Button
                color={value}
                onClick={() => setSettingsPopover(true)}
                ml={"md"}
                mr={"sm"}
                mt={27}
              >
                <Settings></Settings>
              </Button>
            }
          >
            <Switch
              label={"Show Advantage"}
              checked={showAdvantage}
              onChange={(ev) => setShowAdvantage(ev.currentTarget.checked)}
            />
            <Switch
              label={"Show Neutral"}
              checked={showNeutral}
              onChange={(ev) => setShowNeutral(ev.currentTarget.checked)}
            />
            <Switch
              label={"Show Disadvantage"}
              checked={showDisadvantage}
              onChange={(ev) => setShowDisadvantage(ev.currentTarget.checked)}
            />
          </Popover>
        </div>
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <TextInput
            mt={"sm"}
            label={"Damage"}
            value={damagerDamage}
            placeholder={"1d10+5"}
            onChange={(ev) => setDamagerDamage(ev.currentTarget.value)}
            style={{ width: "80%" }}
          ></TextInput>
          <NumberInput
            label={"Attack Count"}
            onChange={(c) => setDamagerCount(c || 1)}
            value={damagerCount}
            mt={"sm"}
            ml={"sm"}
            style={{ width: "30%" }}
            mr={"xs"}
          ></NumberInput>
        </div>
        <MultiSelect
          data={attackModOptions}
          creatable
          // ref={ref as MutableRefObject<HTMLInputElement>}
          label={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              Attack Modifiers{" "}
              <Tooltip
                label={"Examples: 1d4, +1d4, -1d4, CustomName [+1d4]"}
                pl={4}
                mt={4}
              >
                <InfoCircle size={16} />
              </Tooltip>
            </div>
          }
          error={attackModError}
          searchable
          clearable
          getCreateLabel={(query) => {
            return query.match(modRegex)
              ? `+ Add ${query}`
              : "+-1dX or Name [+-1dX]";
          }}
          placeholder={attackModPlaceholder}
          onCreate={(query) => {
            if (!query.match(modRegex)) {
              setAttackModError(true);
              setAttackModPlaceholder("Invalid Format");
              setTimeout(() => {
                setAttackModError(false);
                setAttackModPlaceholder("");
              }, 1500);
            }
          }}
          onChange={onUpdateAttackMods}
          value={attackModSelected}
        />
        <Switch label={"Disabled"} pt={"sm"} />
        <Text weight={"bold"} mt={"sm"}>
          Expected Damage
        </Text>
        <Table>
          <tbody>
            {showDisadvantage ? (
              <tr key={"disadvantage"}>
                <td>Disadvantage</td>
                <td>
                  {damageContext
                    ?.get(playerKey)
                    ?.get(damager.key)
                    ?.get("disadvantage")
                    ?.get(target.ac)
                    ?.toFixed(2) ||
                    (damageContext
                      ?.get(playerKey)
                      ?.get(damager.key)
                      ?.get("disadvantage")
                      ?.get(0) || 0) *
                      (1 / 19)}
                </td>
              </tr>
            ) : (
              <></>
            )}
            {showNeutral ? (
              <tr key={"normal"}>
                <td>Normal</td>
                <td>
                  {damageContext
                    ?.get(playerKey)
                    ?.get(damager.key)
                    ?.get("normal")
                    ?.get(target.ac)
                    ?.toFixed(2)}
                </td>
              </tr>
            ) : (
              <></>
            )}
            {showAdvantage && (
              <tr key={"advantage"}>
                <td>Advantage</td>
                <td>
                  {damageContext
                    ?.get(playerKey)
                    ?.get(damager.key)
                    ?.get("advantage")
                    ?.get(target.ac)
                    ?.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Button
            mt={"md"}
            mr={"md"}
            leftIcon={<Copy />}
            onClick={() =>
              dispatchPlayerList({
                field: "COPY_DAMAGER",
                playerKey,
                newDamager: damager,
              })
            }
          >
            Copy
          </Button>
          <Button
            mt={"md"}
            variant={"outline"}
            color={"red"}
            leftIcon={<Trash />}
            onClick={() =>
              dispatchPlayerList({
                field: "DELETE_DAMAGER",
                playerKey: playerKey,
                damagerKey: damager.key,
              })
            }
          >
            Delete
          </Button>
        </div>
      </Box>
    </Paper>
  );
};

export default DamagerCard;
