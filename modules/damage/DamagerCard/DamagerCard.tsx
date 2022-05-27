import React, { useContext, useEffect, useState } from 'react';
import type { SelectItem } from '@mantine/core';
import {
  Box,
  Button,
  MultiSelect,
  NumberInput,
  Paper,
  Popover,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import {
  Copy, InfoCircle, Settings, Trash,
} from 'tabler-icons-react';
import { useDebouncedCallback } from 'use-debounce';
import type { Target } from '@pages/Damage';
import {
  DamageDataContext,
  DamageDetailsContext,
  DispatchPlayerList,
  InitialPlayerListContext,
} from '@pages/Damage';
import type { AdvantageType, Damager } from '@damage/types';

export type critType = 'none' | 'normal' | 'maximized';

function DamagerCard({
  target,
  damager,
  playerKey,
}: {
  target: Target;
  damager: Damager;
  playerKey: number;
}) {
  // const [value, toggle] = useToggle('Attack', ['Attack', 'Save']);

  const [atkModId, setAtkModId] = useState(3);

  const getAtkModID = () => {
    const i = atkModId;
    setAtkModId(i + 1);
    return (i + 1).toString();
  };

  const dispatchPlayerList = useContext(DispatchPlayerList)!;
  const damageContext = useContext(DamageDataContext)!;
  const damageDetailsContext = useContext(DamageDetailsContext)!;
  // const initialPlayerList = useContext(InitialPlayerListContext)!;

  // region [[Form Meta]]
  const [settingsPopover, setSettingsPopover] = useState(false);
  const [attackModPlaceholder, setAttackModPlaceholder] = useState('');
  const [attackModError, setAttackModError] = useState(false);
  // endregion

  // region [[FormState]]
  const [attackModOptions, setAttackModOptions] = useState<SelectItem[]>(
    damager.modifierOptions,
  );
  const [attackModSelected, setAttackModSelected] = useState<string[]>(
    damager.modifierRaws,
  );
  const [attackModParsed, setAttackModParsed] = useState<string[]>([]);
  const [damagerName, setDamagerName] = useState(damager.name);
  const [damagerDamage, setDamagerDamage] = useState(damager.damage);
  const [damagerCount, setDamagerCount] = useState(damager.count);

  const [showSuperAdvantage, setShowSuperAdvantage] = useState(false);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showDisadvantage, setShowDisadvantage] = useState(false);
  const showAdvantageTypes: Record<Exclude<AdvantageType, 'superdisadvantage'>, boolean> = {
    advantage: showAdvantage,
    superadvantage: showSuperAdvantage,
    normal: showNeutral,
    disadvantage: showDisadvantage,
  };
  const [showSuperAdvantageDetails, setShowSuperAdvantageDetails] = useState(false);
  const [showAdvantageDetails, setShowAdvantageDetails] = useState(false);
  const [showNeutralDetails, setShowNeutralDetails] = useState(false);
  const [showDisadvantageDetails, setShowDisadvantageDetails] = useState(false);
  const showAdvantageTypesDetails: Record<Exclude<AdvantageType, 'superdisadvantage'>, boolean> = {
    advantage: showSuperAdvantageDetails,
    superadvantage: showAdvantageDetails,
    normal: showNeutralDetails,
    disadvantage: showDisadvantageDetails,
  };
  const setShowAdvantageTypesDetails: Record<Exclude<AdvantageType, 'superdisadvantage'>, React.Dispatch<React.SetStateAction<boolean>>> = {
    advantage: setShowSuperAdvantageDetails,
    superadvantage: setShowAdvantageDetails,
    normal: setShowNeutralDetails,
    disadvantage: setShowDisadvantageDetails,
  };

  const setShowAdvantageTypes: Record<Exclude<AdvantageType, 'superdisadvantage'>, React.Dispatch<React.SetStateAction<boolean>>> = {
    advantage: setShowAdvantage,
    superadvantage: setShowSuperAdvantage,
    normal: setShowNeutral,
    disadvantage: setShowDisadvantage,
  };

  const [disabled, toggleDisabled] = useToggle(false, [true, false]);
  // endregion

  const [showSpecialPopover, setShowSpecialPopover] = useState(false);
  const [specialGWM, setSpecialGWM] = useState(false);
  const [specialPAM, setSpecialPAM] = useState(false);
  // const [specialGWM, toggleSpecialGWM] = useToggle(false, [true, false]);
  // const [specialPAM, toggleSpecialPAM] = useToggle(false, [true, false]);

  const modRegex = /^[^\-[]*\[?(([+-]?((\d+d)?\d+))]?)$/;

  const debouncedDispatchPlayerList = useDebouncedCallback(
    dispatchPlayerList,
    500,
  );

  useEffect(() => {
    debouncedDispatchPlayerList({
      field: 'UPDATE_DAMAGER',
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
        disabled,
        advantageShow: new Map([
          ['superadvantage', showSuperAdvantage],
          ['advantage', showAdvantage],
          ['normal', showNeutral],
          ['disadvantage', showDisadvantage],
        ]),
      },
    });
    // eslint-disable-next-line max-len
  }, [damagerDamage, damagerName, damagerCount,
    showSuperAdvantage, showAdvantage, showDisadvantage, showNeutral,
    attackModParsed, attackModSelected, attackModOptions,
    disabled, playerKey]);

  useEffect(() => {
    setAttackModParsed(
      attackModSelected.map(
        (modV) => attackModOptions
          .find((option) => option.value === modV)!
          .label!.match(modRegex)![2],
      ),
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
    overrideAttackOptions?: SelectItem[],
  ) => {
    const originalAttackOptions = overrideAttackOptions || attackModOptions;
    let newAttackOptions = [...originalAttackOptions];

    const newAttackModIDs = newAttackModRawVals
      .map((mod) => {
        if (!mod.match(modRegex)) {
          return undefined;
        }
        if (originalAttackOptions.map((x) => x.value).includes(mod)) {
          return mod;
        }
        const newId = getAtkModID();
        const newOption = {
          label: mod,
          value: newId,
        };
        newAttackOptions = [...originalAttackOptions, newOption];
        return newId;
      })
      .filter((x) => x) as string[];

    const seenLabels = new Set();
    const attackModOptionsDeduped = newAttackOptions.filter((v) => {
      if (newAttackModIDs.includes(v.value)) {
        return true;
      }
      if (!seenLabels.has(v.label)) {
        seenLabels.add(v.label);
        return true;
      }
      return false;
    });

    setAttackModOptions(
      attackModOptionsDeduped.sort((a, b) => a.label!.localeCompare(b.label!)),
    );
    setAttackModSelected(newAttackModIDs);
  };

  return (
    // sx={{ maxWidth: 320 }}
    <Paper shadow="xs" p="md" mt="md" withBorder>
      <Box mx="auto">
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <TextInput
            label={`Name: ${damager.key}`}
            placeholder="Eldritch Blast"
            value={damagerName}
            style={{ width: '100%' }}
            onChange={(ev) => setDamagerName(ev.currentTarget.value)}
          />
          <Popover
            opened={settingsPopover}
            onClose={() => setSettingsPopover(false)}
            position="right"
            withArrow
            target={(
              <Button
                color="blue"
                onClick={() => setSettingsPopover(true)}
                ml="md"
                mr="sm"
                mt={27}
              >
                <Settings />
              </Button>
            )}
          >
            <Switch
              label="Show Superadvantage"
              checked={showSuperAdvantage}
              onChange={(ev) => setShowSuperAdvantage(ev.currentTarget.checked)}
            />
            <Switch
              label="Show Advantage"
              checked={showAdvantage}
              onChange={(ev) => setShowAdvantage(ev.currentTarget.checked)}
            />
            <Switch
              label="Show Neutral"
              checked={showNeutral}
              onChange={(ev) => setShowNeutral(ev.currentTarget.checked)}
            />
            <Switch
              label="Show Disadvantage"
              checked={showDisadvantage}
              onChange={(ev) => setShowDisadvantage(ev.currentTarget.checked)}
            />
          </Popover>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <TextInput
            mt="sm"
            label="Damage"
            value={damagerDamage}
            placeholder="1d10+mod"
            onChange={(ev) => setDamagerDamage(ev.currentTarget.value)}
            style={{ width: '60%' }}
          />
          <NumberInput
            label="Attack Count"
            onChange={(c) => setDamagerCount(c || 1)}
            value={damagerCount}
            mt="sm"
            ml="sm"
            style={{ width: '40%' }}
            mr="xs"
          />
        </div>
        <MultiSelect
          data={attackModOptions}
          creatable
          // ref={ref as MutableRefObject<HTMLInputElement>}
          label={(
            <div
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              Attack Modifiers
              <Tooltip
                label="Examples: 1d4, +1d4, -1d4, CustomName [+1d4]"
                pl={4}
                mt={4}
              >
                <InfoCircle size={16} />
              </Tooltip>
            </div>
          )}
          error={attackModError}
          searchable
          clearable
          getCreateLabel={(query) => (query.match(modRegex)
            ? `+ Add ${query}`
            : '+-1dX or Name [+-1dX]')}
          placeholder={attackModPlaceholder}
          onCreate={(query) => {
            if (!query.match(modRegex)) {
              setAttackModError(true);
              setAttackModPlaceholder('Invalid Format');
              setTimeout(() => {
                setAttackModError(false);
                setAttackModPlaceholder('');
              }, 1500);
            }
          }}
          onChange={onUpdateAttackMods}
          value={attackModSelected}
        />
        <Switch label="Disabled" pt="sm" checked={disabled} onChange={() => toggleDisabled()} />
        <Text weight="bold" mt="sm">Expected Damage</Text>
        <Table>
          <tbody>
            {(['normal', 'advantage', 'superadvantage', 'disadvantage'] as Exclude<AdvantageType, 'superdisadvantage'>[]).map((advType) => showAdvantageTypes[advType]
            && (
            <tr key={advType}>
              <td>
                {advType[0].toUpperCase()}
                {advType.substr(1)}
              </td>
              <td>
                <Popover
                  opened={showAdvantageTypesDetails[advType]}
                  onClose={() => setShowAdvantageTypesDetails[advType](false)}
                  position="right"
                  withArrow
                  target={(
                    <Text variant="link" onClick={() => setShowAdvantageTypesDetails[advType](true)}>
                      {damageContext
                        ?.get(playerKey)
                        ?.get(damager.key)
                        ?.get(advType)
                        ?.get(target.ac)
                        ?.toFixed(3)}
                    </Text>
)}
                >
                  <Table>
                    <tbody>
                      <tr>
                        <th>Damage</th>
                        <th>Chance</th>
                      </tr>
                      {[...damageDetailsContext?.get(playerKey)?.get(damager.key)?.get(advType)?.get(target.ac)
                        ?.entries() || []].sort(([aK, aV], [bK, bV]) => aK - bK).map(
                        ([val, prob]) => (
                          <tr>
                            <td>{val}</td>
                            <td>
                              {(prob.valueOf() * 100).toFixed(2)}
                              %
                            </td>
                          </tr>
                        ),
                      )}

                    </tbody>
                  </Table>
                </Popover>

              </td>
            </tr>
            )).filter((x) => x)}
          </tbody>
          {/* <tbody> */}
          {/*  {showDisadvantage && ( */}
          {/*  <tr key="disadvantage"> */}
          {/*    <td>Disadvantage</td> */}
          {/*    <td> */}
          {/*      {damageContext */}
          {/*        ?.get(playerKey) */}
          {/*        ?.get(damager.key) */}
          {/*        ?.get('disadvantage') */}
          {/*        ?.get(target.ac) */}
          {/*        ?.toFixed(3)} */}
          {/*    </td> */}
          {/*  </tr> */}
          {/*  )} */}
          {/*  {showNeutral && ( */}
          {/*  <tr key="normal"> */}
          {/*    <td>Normal</td> */}
          {/*    <td> */}
          {/*      {damageContext */}
          {/*        ?.get(playerKey) */}
          {/*        ?.get(damager.key) */}
          {/*        ?.get('normal') */}
          {/*        ?.get(target.ac) */}
          {/*        ?.toFixed(3)} */}
          {/*    </td> */}
          {/*  </tr> */}
          {/*  )} */}
          {/*  {showAdvantage && ( */}
          {/*  <tr key="advantage"> */}
          {/*    <td>Advantage</td> */}
          {/*    <td> */}
          {/*      {damageContext */}
          {/*        ?.get(playerKey) */}
          {/*        ?.get(damager.key) */}
          {/*        ?.get('advantage') */}
          {/*        ?.get(target.ac) */}
          {/*        ?.toFixed(3)} */}
          {/*    </td> */}
          {/*  </tr> */}
          {/*  )} */}
          {/* </tbody> */}
        </Table>

        <Popover
          opened={showSpecialPopover}
          onClose={() => setShowSpecialPopover(false)}
          position="bottom"
          withArrow
          target={(
            <Button
              color="blue"
              onClick={() => setShowSpecialPopover(true)}
              variant="outline"
            >
              Special
            </Button>
          )}
        >
          <Switch
            label="Factor Polearm Master BA Attack"
            checked={specialPAM}
            onChange={(ev) => setSpecialPAM(ev.currentTarget.checked)}
          />
          <Switch
            label="Factor Great Weapon Master BA Attack"
            checked={specialGWM}
            onChange={(ev) => setSpecialGWM(ev.currentTarget.checked)}
          />
          {/* <Switch */}
          {/*  label="Show Neutral" */}
          {/*  checked={showNeutral} */}
          {/*  onChange={(ev) => setShowNeutral(ev.currentTarget.checked)} */}
          {/* /> */}
          {/* <Switch */}
          {/*  label="Show Disadvantage" */}
          {/*  checked={showDisadvantage} */}
          {/*  onChange={(ev) => setShowDisadvantage(ev.currentTarget.checked)} */}
          {/* /> */}
        </Popover>

        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Button
            mt="md"
            mr="md"
            leftIcon={<Copy />}
            onClick={() => dispatchPlayerList(
              { field: 'COPY_DAMAGER', playerKey, newDamager: damager },
            )}
          >
            Copy
          </Button>
          <Button
            mt="md"
            variant="outline"
            color="red"
            leftIcon={<Trash />}
            onClick={() => dispatchPlayerList(
              { field: 'DELETE_DAMAGER', playerKey, damagerKey: damager.key },
            )}
          >
            Delete
          </Button>
        </div>
      </Box>
    </Paper>
  );
}

export default DamagerCard;
