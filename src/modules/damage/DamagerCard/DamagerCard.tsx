import React, { useContext, useEffect, useState } from 'react';
import type { SelectItem } from '@mantine/core';
import {
  Box, Button, MultiSelect, Paper, Switch, Text, Tooltip, useMantineColorScheme,
} from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { Copy, InfoCircle, Trash } from 'tabler-icons-react';
import { useDebouncedCallback } from 'use-debounce';
import type { Target } from '@pages/Damage';
import type { AdvantageType, Damager } from '@damage/types';
import DamagerTable from '@damage/DamagerCard/DamagerTable';
import RegularDamageInfo from '@damage/DamagerCard/RegularDamageInfo';
import { DamageDataContext, DamageDetailsContext, DispatchPlayerListContext } from '@damage/contexts';

// console.log({ DamagerTable });
export type critType = 'none' | 'normal' | 'maximized';

const DamagerCard = ({
  target,
  damager,
  playerKey,
}: {
  target: Target;
  damager: Damager;
  playerKey: number;
}) => {
  // const [value, toggle] = useToggle('Attack', ['Attack', 'Save']);
  const { colorScheme } = useMantineColorScheme();
  const darkTheme = colorScheme === 'dark';
  const [atkModId, setAtkModId] = useState(3);

  const getAtkModID = () => {
    const i = atkModId;
    setAtkModId(i + 1);
    return (i + 1).toString();
  };

  const dispatchPlayerList = useContext(DispatchPlayerListContext)!;
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
  const [showSuperDisadvantage, setShowSuperDisadvantage] = useState(false);
  const showAdvantageTypes: Record<AdvantageType, boolean> = {
    advantage: showAdvantage,
    superadvantage: showSuperAdvantage,
    normal: showNeutral,
    disadvantage: showDisadvantage,
    superdisadvantage: showSuperDisadvantage,
  };
  const [showSuperAdvantageDetails, setShowSuperAdvantageDetails] = useState(false);
  const [showAdvantageDetails, setShowAdvantageDetails] = useState(false);
  const [showNeutralDetails, setShowNeutralDetails] = useState(false);
  const [showDisadvantageDetails, setShowDisadvantageDetails] = useState(false);
  const [showSuperDisadvantageDetails, setShowSuperDisadvantageDetails] = useState(false);
  const showAdvantageTypesDetails: Record<AdvantageType, boolean> = {
    advantage: showSuperAdvantageDetails,
    superadvantage: showAdvantageDetails,
    normal: showNeutralDetails,
    disadvantage: showDisadvantageDetails,
    superdisadvantage: showSuperDisadvantageDetails,
  };
  const setShowAdvantageTypesDetails: Record<AdvantageType, React.Dispatch<React.SetStateAction<boolean>>> = {
    advantage: setShowSuperAdvantageDetails,
    superadvantage: setShowAdvantageDetails,
    normal: setShowNeutralDetails,
    disadvantage: setShowDisadvantageDetails,
    superdisadvantage: setShowSuperDisadvantageDetails,
  };
  const setShowAdvantageTypes: Record<AdvantageType, React.Dispatch<React.SetStateAction<boolean>>> = {
    advantage: setShowAdvantage,
    superadvantage: setShowSuperAdvantage,
    normal: setShowNeutral,
    disadvantage: setShowDisadvantage,
    superdisadvantage: setShowSuperDisadvantage,
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
          ['superdisadvantage', showSuperDisadvantage],
        ]),
      },
    });
    // eslint-disable-next-line max-len
  }, [damagerDamage, damagerName, damagerCount,
    showSuperAdvantage, showAdvantage, showDisadvantage, showNeutral, showSuperDisadvantage,
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

  const DamageInfoComponent = ({
    regular: RegularDamageInfo,
  } as Record<Damager['damagerType'], typeof RegularDamageInfo>)[damager.damagerType];

  return (
    // sx={{ maxWidth: 320 }}
    <Paper shadow="xs" p="xs" mt="xs" pt="0" pb="1" withBorder style={{ borderLeftColor: darkTheme ? 'orange' : 'blue' }}>
      <Box mx="auto">
        <DamageInfoComponent {...{
          damager, disabled, toggleDisabled, damagerName, setDamagerName, showAdvantageTypes, setShowAdvantageTypes, damagerDamage, setDamagerDamage, damagerCount, setDamagerCount,
        }}
        />

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Switch label="Disabled" pt="sm" checked={disabled} onChange={() => toggleDisabled()} />
          <Switch label="Melee" pt="sm" checked={disabled} onChange={() => toggleDisabled()} />
        </div>
        <Text weight="bold" mt="sm">Expected Damage</Text>
        <DamagerTable
          showAdvantageTypes={showAdvantageTypes}
          showAdvantageTypesDetails={showAdvantageTypesDetails}
          setShowAdvantageTypesDetails={setShowAdvantageTypesDetails}
          getDamageString={(advType: AdvantageType) => damageContext?.get(playerKey)?.get(damager.key)?.get(advType)?.get(target.ac)
            ?.toFixed(3) || ''}
          getDamageDetailsPMF={(advType: AdvantageType) => damageDetailsContext?.get(playerKey)?.get(damager.key)?.get(advType)?.get(target.ac)}
        />

        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Button
            mt="md"
            mr="md"
            variant="outline"
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
};

export default DamagerCard;
