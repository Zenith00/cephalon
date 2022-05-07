import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  MultiSelect,
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
import { AdvantageType, AdvantageTypes, Damager } from "./PlayerCard";
import { Copy, InfoCircle, Settings, Trash } from "tabler-icons-react";
import { useDebouncedCallback } from "use-debounce";
import {
  DamageDataContext,
  DispatchPlayerList,
  InitialPlayerListContext,
  PlayerContext,
  Target,
} from "../../../pages/Damage";
import {
  boundProb,
  cumSum,
  d20ToCritrate,
  d20ToFailRate,
  diceToPMF,
  PMF,
  simpleProcess,
} from "../../../utils/math";

export type critType = "none" | "normal" | "maximized";

const attackModDefaults = [
  ["Bless [+1d4]", "0"],
  ["Bane [-1d4]", "1"],
] as [string, string][];

const DamagerCard = ({
  target,
  damager,
  playerKey,
}: // setDamager,

{
  // key: keyof Player["damagers"];
  target: Target;
  damager: Damager;
  playerKey: number;
  // setDamager: (damager: Damager) => void;
}) => {
  const [value, toggle] = useToggle("Attack", ["Attack", "Save"]);

  // const [attackModLabelToValue, setAttackModLabelToValue] = useState<{
  //   [s: string]: string;
  // }>(
  //   attackModDefaults.reduce((acc, [label, value]) => {
  //     acc[label] = value;
  //     return acc;
  //   }, {} as { [k: string]: string })
  // );

  // const [attackModValueToLabel, setAttackModValueToLabel] = useState<{
  //   [s: string]: string;
  // }>(
  //   attackModDefaults.reduce((acc, [label, value]) => {
  //     acc[value] = label;
  //     return acc;
  //   }, {} as { [k: string]: string })
  // );
  const [atkModId, setAtkModId] = useState(3);

  const getAtkModID = () => {
    let i = atkModId;
    setAtkModId(i + 1);
    return (i + 1).toString();
  };

  useEffect(() => {}, [target]);

  const dispatchPlayerList = useContext(DispatchPlayerList)!;
  const damageContext = useContext(DamageDataContext)!;

  const initialPlayerList = useContext(InitialPlayerListContext)!;

  //region [[Form Meta]]
  const [settingsPopover, setSettingsPopover] = useState(false);
  const [attackModPlaceholder, setAttackModPlaceholder] = useState("");
  const [attackModError, setAttackModError] = useState(false);
  const [attackModOptions, setAttackModOptions] = useState<SelectItem[]>([]);
  //endregion

  //region [[FormState]]
  const [attackModSelected, setAttackModSelected] = useState<string[]>([]);
  const [attackModParsed, setAttackModParsed] = useState<string[]>([]);
  const [damagerName, setDamagerName] = useState(damager.name);
  const [damagerDamage, setDamagerDamage] = useState(damager.damage);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showDisadvantage, setShowDisadvantage] = useState(false);
  //endregion

  const modRegex = /^[\w ]*\[?(([+-]?((\d+d)?\d+))]?)$/;

  // const [attackModID, setAttackModID] = useState(attackModOptions.length);

  // const ref = useRef<HTMLInputElement>();

  // const debouncedSetDamager = useDebouncedCallback((damager: Damager) => {
  //    setDamager(damager);
  // }, 500);

  //region [[FormState to DamagerState]]

  const debouncedDispatchPlayerList = useDebouncedCallback(
    dispatchPlayerList,
    500
  );

  useEffect(() => {
    console.log("got update  :)");

    debouncedDispatchPlayerList({
      field: "UPDATE_DAMAGER",
      playerKey,
      damagerKey: damager.key,
      newDamager: {
        ...damager,
        name: damagerName,
        damage: damagerDamage,
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
    // setDamager({
    //    ...damager,
    //    modifiers: attackModSelected.map(
    //       (modV) =>
    //          attackModOptions
    //             .find((option) => option.value! === modV)!
    //             .label!.match(modRegex)![2]
    //    ),
    // });
  }, [attackModSelected]);

  // const debouncedUpdateGraphs = useDebouncedCallback(
  //   () => {
  //     // Object.entries(damager).map(([key, damager]) => {
  //     // const d =;
  //     let atkbonus =
  //       playerAtkBonus >= 0
  //         ? `+${playerAtkBonus}`
  //         : `${playerAtkBonus}`;
  //     let simpleDamagePMF = simpleProcess(damager.damage || "0");
  //     let simpleAttackPMF = simpleProcess(`1d20 + ${atkbonus}`);
  //
  //     if (simpleDamagePMF && simpleAttackPMF) {
  //       let simpleDamage = [...simpleDamagePMF.entries()].reduce(
  //         (acc, [d, p]) => (acc += d * p),
  //         0
  //       );
  //       let cumsum = cumSum(simpleAttackPMF);
  //       let seen = false;
  //
  //       setDamager({
  //         ...damager, damageByAC:
  //           [...Array(30).keys()].reduce((acc, c) => {
  //             acc.set(c, (1 - boundProb(cumsum.get(c) || (seen ? 1 : 0))) * simpleDamage);
  //             return acc;
  //           }, new Map<number, number>())
  //       });
  //
  //
  //       // } else {
  //       //   // Array.from({ length: 30 }, (x, i) => i).map((ac) => {
  //       //   const r = workersRef.current;
  //       //   if (r) {
  //       //     // r.map((w) => {
  //       //
  //       //
  //       //     r[parseInt(key) % NUM_WORKERS].postMessage({
  //       //       index: key,
  //       //       damage: damager.damage ?? 0,
  //       //     });
  //       //     // });
  //       //   }
  //       // }
  //
  //       // });
  //     }
  //   )
  //     ;
  //   },
  //   1000,
  //   { leading: true }
  // );

  // useEffect(() => {
  //
  //
  //

  //   debouncedSetDamager({
  //     ...damager,
  //     name: damagerName,
  //     damage: damagerDamage
  //     // modifiers: attackModSelected
  //     //   .map((s) => attackModValueToLabel[s].match(modRegex)?.[2])
  //     //   .filter((x) => x) as string[],
  //   });
  // }, [debouncedSetDamager, damagerName, damagerDamage, attackModSelected]);

  useEffect(() => {
    if (!initialPlayerList?.[playerKey]?.damagers?.[damager.key]) {
      return;
    }
    setShowAdvantage(
      initialPlayerList[playerKey].damagers[damager.key].advantageShow.get(
        "advantage"
      )!
    );
    setShowDisadvantage(
      initialPlayerList[playerKey].damagers[damager.key].advantageShow.get(
        "disadvantage"
      )!
    );
    setShowNeutral(
      initialPlayerList[playerKey].damagers[damager.key].advantageShow.get(
        "normal"
      )!
    );
    setDamagerDamage(initialPlayerList[playerKey].damagers[damager.key].damage);
    setDamagerName(initialPlayerList[playerKey].damagers[damager.key].name);
    setAttackModOptions(
      initialPlayerList[playerKey].damagers[damager.key].modifierOptions
    );
    setAttackModSelected(
      initialPlayerList[playerKey].damagers[damager.key].modifierRaws
    );
    onUpdateAttackMods(
      initialPlayerList[playerKey].damagers[damager.key].modifierRaws,
      initialPlayerList[playerKey].damagers[damager.key].modifierOptions
    );
  }, [initialPlayerList]);

  const onUpdateAttackMods = (
    v: string[],
    overrideAttackOptions?: SelectItem[]
  ) => {
    console.log("UPDATING ATTACK MODS");
    console.log(v);
    // console.log(attackModOptions);

    let originalAttackOptions = overrideAttackOptions || attackModOptions;
    let newAttackOptions = [...originalAttackOptions];
    console.log(newAttackOptions);

    const n = v
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

          // setAttackModOptions();
          newAttackOptions = [...originalAttackOptions, newOption];
          return newId;
          // return attackModOptions.find(
          //   (x) =>
          //     x.label === mod && !attackModSelected.includes(x.value)
          // );
        }
        return mod;
        // if (!attackModOptions.map((x) => x.label).includes(mod)) {
        //   setAttackModOptions([
        //     ...attackModOptions,
        //     { label: mod, value: (attackModID++).toString() },
        //   ]);
        // }

        return mod;
      })
      .filter((x) => x) as string[];

    console.log({ n });
    let seenLabels = new Set();
    let filterPoss = newAttackOptions.filter((v) => {
      if (n.includes(v.value)) {
        return true;
      } else {
        if (!seenLabels.has(v.label)) {
          seenLabels.add(v.label);
          return true;
        }
        return false;
      }
    });

    console.log("SETTING ATTACK MOD OPTIONS");
    console.log(filterPoss);
    setAttackModOptions(
      filterPoss.sort((a, b) => a.label!.localeCompare(b.label!))
    );

    setAttackModSelected(n);
  };

  return (
    <Paper shadow={"xs"} p={"md"} mt={"md"} sx={{ maxWidth: 320 }} withBorder>
      <Box mx="auto">
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <TextInput
            label={`Name: ${damager.key}`}
            placeholder="Eldritch Blast"
            value={damagerName}
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
        <TextInput
          mt={"sm"}
          label={"Damage"}
          value={damagerDamage}
          placeholder={"1d10+5"}
          onChange={(ev) => setDamagerDamage(ev.currentTarget.value)}
        ></TextInput>
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
          // filter={(value, selected, item) =>
          //   !selected &&
          //   (item.label!.toLowerCase().includes(value.toLowerCase().trim()) ||
          //     item.description
          //       .toLowerCase()
          //       .includes(value.toLowerCase().trim()))
          // }
        />
        <Switch label={"Disabled"} pt={"sm"} />
        {/*<Text pt={"sm"}>*/}
        <Text weight={"bold"} mt={"sm"}>
          Expected Damage
        </Text>
        {/*</Text>*/}

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
                    ?.toFixed(2)}
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
            {showAdvantage ? (
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
            ) : (
              <></>
            )}
          </tbody>
        </Table>
        {/*<Group position='right' mt='md'>*/}
        {/*  <Button type='submit'>Submit</Button>*/}
        {/*</Group>*/}
        {/*</form>*/}
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
