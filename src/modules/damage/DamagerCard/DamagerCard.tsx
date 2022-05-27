import React, { useContext, useEffect, useState } from 'react';
import type { SelectItem } from '@mantine/core';
import {
  Popover,
  Box, Button, MultiSelect, Paper, Switch, Text, Tooltip, useMantineColorScheme,
} from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { Copy, InfoCircle, Trash } from 'tabler-icons-react';
import { useDebouncedCallback } from 'use-debounce';
import type { Target } from '@pages/Damage';
import type { AdvantageType, Damager, PlayerKey } from '@damage/types';
import DamagerTable from '@damage/DamagerCard/DamagerTable';
import RegularDamageInfo from '@damage/DamagerCard/DamageInfo/RegularDamageInfo';
import { DamageDataContext, DamageDetailsContext, DispatchPlayerListContext } from '@damage/contexts';
import PowerAttackDamageInfo from '@damage/DamagerCard/DamageInfo/PowerAttackDamageInfo';

// console.log({ DamagerTable });
export type critType = 'none' | 'normal' | 'maximized';

const DamagerCard = ({
  target,
  damager,
  playerKey,
}: {
  target: Target;
  damager: Damager;
  playerKey: PlayerKey;
}) => {
  // const [value, toggle] = useToggle('Attack', ['Attack', 'Save']);
  const { colorScheme } = useMantineColorScheme();
  const darkTheme = colorScheme === 'dark';

  const dispatchPlayerList = useContext(DispatchPlayerListContext)!;
  const damageContext = useContext(DamageDataContext)!;
  const damageDetailsContext = useContext(DamageDetailsContext)!;
  // const initialPlayerList = useContext(InitialPlayerListContext)!;

  // region [[Form Meta]]
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
  const [factorPAM, toggleFactorPAM] = useToggle(false, [true, false]);
  const [factorGWM, toggleFactorGWM] = useToggle(false, [true, false]);
  const [powerAttack, togglePowerAttack] = useToggle(false, [true, false]);
  const [powerAttackOptimalOnly, togglePowerAttackOptimalOnly] = useToggle(true, [true, false]);

  const [showDamagerSpecial, setShowDamagerSpecial] = useState(false);

  // endregion

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
        damagerType: powerAttack ? 'powerAttack' : 'regular',
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
        flags: {
          gwm: factorGWM, pam: factorPAM, powerAttackOptimalOnly,
        },
      },
    });
    // eslint-disable-next-line max-len,react-hooks/exhaustive-deps
  }, [damagerDamage, damagerName, damagerCount,
    showSuperAdvantage, showAdvantage, showDisadvantage, showNeutral, showSuperDisadvantage,
    attackModParsed, attackModSelected, attackModOptions,
    powerAttack,
    factorGWM, factorPAM,
    disabled, playerKey]);

  useEffect(() => {
    setAttackModParsed(
      attackModSelected.map(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (modV) => attackModOptions
          .find((option) => option.value === modV)!
          .label!.match(modRegex)![2],
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackModSelected]);

  const DamageInfoComponent = ({
    regular: RegularDamageInfo,
    powerAttack: PowerAttackDamageInfo,
  } as Record<Damager['damagerType'], typeof RegularDamageInfo>)[damager.damagerType];

  return (
    // sx={{ maxWidth: 320 }}
    <Paper shadow="xs" p="xs" mt="xs" pt="0" pb="1" withBorder style={{ borderLeftColor: darkTheme ? 'orange' : 'blue' }}>
      <Box mx="auto">
        <DamageInfoComponent {...{
          damager,
          disabled,
          toggleDisabled,
          damagerName,
          setDamagerName,
          showAdvantageTypes,
          setShowAdvantageTypes,
          damagerDamage,
          setDamagerDamage,
          damagerCount,
          setDamagerCount,
          attackModOptions,
          setAttackModOptions,
          modRegex,
          attackModSelected,
          setAttackModSelected,
        }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* <Switch label="Disabled" pt="sm" checked={disabled} onChange={() => toggleDisabled()} /> */}
          <Popover
            opened={showDamagerSpecial}
            onClose={() => setShowDamagerSpecial(false)}
            position="right"
            withArrow
            target={(
              <Button
                color="blue"
                onClick={() => setShowDamagerSpecial(!showDamagerSpecial)}
                ml="sm"
                mr="sm"
                mt={27}
                variant="outline"
              >
                Special
              </Button>
            )}
          >
            <Switch label="Factor PAM Bonus Action Attack Option" pt="sm" checked={factorPAM} onChange={() => toggleFactorPAM()} />
            <Switch label="Factor GWM Bonus Action Attack Option" pt="sm" checked={factorGWM} onChange={() => toggleFactorGWM()} />
            <Switch label="Sharpshooter/Great Weapon Master" pt="sm" checked={powerAttack} onChange={() => togglePowerAttack()} />
            {powerAttack && <Switch label="Use SS/GWM only when optimal" pt="sm" checked={powerAttackOptimalOnly} onChange={() => togglePowerAttackOptimalOnly()} />}
          </Popover>

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
