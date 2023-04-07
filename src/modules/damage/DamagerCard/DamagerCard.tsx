import React, {
  useContext, useEffect, useState, useRef,
} from 'react';
import type { SelectItem } from '@mantine/core';
import {
  InputWrapper,
  SegmentedControl,
  Box, Button, Paper, Popover, Switch, Text, useMantineColorScheme,
} from '@mantine/core';
import { useSetState, useToggle } from '@mantine/hooks';
import { Copy, Trash } from 'tabler-icons-react';
import { useDebouncedCallback } from 'use-debounce';
import type { Target } from '@pages/Damage';
import type {
  AdvantageType, Damager, PlayerKey,
} from '@damage/types';
import DamagerTable from '@damage/DamagerCard/DamagerTable';
import RegularDamageInfo from '@damage/DamagerCard/DamageInfo/RegularDamageInfo';
import { AdvancedModeContext, DamageDataContext, DispatchPlayerListContext } from '@damage/contexts';
import PowerAttackDamageInfo from '@damage/DamagerCard/DamageInfo/PowerAttackDamageInfo';
import OnHitDamageInfo from '@damage/DamagerCard/DamageInfo/OnHitDamageInfo';
import AdvantageSelect from '@damage/AdvantageSelect';
import { AdvantageTypes } from '@damage/types';

// console.log({ DamagerTable });

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
  const advancedMode = useContext(AdvancedModeContext);

  const dispatchPlayerList = useContext(DispatchPlayerListContext)!;
  const damageContext = useContext(DamageDataContext)!;
  // const damageDetailsContext = useContext(DamageDetailsContext)!;
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

  // const [showSuperAdvantage, setShowSuperAdvantage] = useState(false);
  // const [showAdvantage, setShowAdvantage] = useState(false);
  // const [showNeutral, setShowNeutral] = useState(true);
  // const [showDisadvantage, setShowDisadvantage] = useState(false);
  // const [showSuperDisadvantage, setShowSuperDisadvantage] = useState(false);
  // const showAdvantageTypes: Record<AdvantageType, boolean> = {
  //   advantage: showAdvantage,
  //   superadvantage: showSuperAdvantage,
  //   normal: showNeutral,
  //   disadvantage: showDisadvantage,
  //   superdisadvantage: showSuperDisadvantage,
  // };
  // const setShowAdvantageTypes: Record<AdvantageType, SetState<boolean>> = {
  //   advantage: setShowAdvantage,
  //   superadvantage: setShowSuperAdvantage,
  //   normal: setShowNeutral,
  //   disadvantage: setShowDisadvantage,
  //   superdisadvantage: setShowSuperDisadvantage,
  // };

  const [showAdvantageTypes, setShowAdvantageTypes] = useSetState({
    advantage: false,
    superadvantage: false,
    normal: true,
    disadvantage: false,
    superdisadvantage: false,
  });
  const [showAdvantageTypeDetails, setShowAdvantageTypeDetails] = useSetState({
    advantage: false,
    superadvantage: false,
    normal: false,
    disadvantage: false,
    superdisadvantage: false,
  });
  // const [[showAdvantageTypes, setShowAdvantageTypes]] = useState(AdvantageSelect());
  // const [[showAdvantageTypeDetails, setShowAdvantageTypeDetails]] = useState(AdvantageSelect(false));

  const [disabled, toggleDisabled] = useToggle(false, [true, false]);
  const [factorPAM, toggleFactorPAM] = useToggle(damager.flags.pam, [true, false]);
  const [factorGWM, toggleFactorGWM] = useToggle(damager.flags.gwm, [true, false]);
  const [triggersOnHit, setTriggersOnHit] = useState(damager.flags.triggersOnHit);

  // const [powerAttack, togglePowerAttack] = useToggle(damager.damagerType === 'powerAttack', [true, false]);
  const [powerAttackOptimalOnly, togglePowerAttackOptimalOnly] = useToggle(damager.flags.powerAttackOptimalOnly, [true, false]);

  const [attackType, setAttackType] = useState<Damager['damagerType']>('regular');
  const [advancedAdvantageMode, setAdvancedAdvantageMode] = useState<AdvantageType>(damager.flags.advanced.advantageMode);
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
        damagerType: attackType,
        damage: damagerDamage,
        count: damagerCount,
        modifiers: attackModParsed,
        modifierOptions: attackModOptions,
        modifierRaws: attackModSelected,
        disabled,
        advantageShow: new Map(AdvantageTypes.map((advType) => [advType, showAdvantageTypes[advType]])),
        flags: {
          gwm: factorGWM, pam: factorPAM, powerAttackOptimalOnly, triggersOnHit, advanced: { advantageMode: advancedAdvantageMode }, triggersFirstHit: false
        },
      },
    });
    // eslint-disable-next-line max-len,react-hooks/exhaustive-deps
  }, [damagerDamage, damagerName, showAdvantageTypes, damagerCount,

    attackModParsed, attackModSelected, attackModOptions,
    attackType, powerAttackOptimalOnly, triggersOnHit,
    factorGWM, factorPAM,
    disabled, playerKey, advancedAdvantageMode]);

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

  const DamageInfoComponent = ({
    regular: RegularDamageInfo,
    powerAttack: PowerAttackDamageInfo,
    onHit: OnHitDamageInfo,
  })[damager.damagerType];

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
        <InputWrapper label="Attack Type">
          <div>
            <SegmentedControl
              data={[{ label: 'Normal', value: 'regular' }, { label: 'SS/GWM', value: 'powerAttack' }].concat((advancedMode ? [{ label: 'On-Hit Effect', value: 'onHit' }] : [])) as {label: string, value: Damager['damagerType']}[]}
              value={attackType}
              onChange={(e: Damager['damagerType']) => {
                if (e === 'onHit') {
                  setTriggersOnHit(false);
                }
                setAttackType(e);
              }}
            />
          </div>
        </InputWrapper>
        {(advancedMode && damager.damagerType !== 'onHit') && (
        <InputWrapper label="Advantage">
          <div>
            <SegmentedControl
              data={AdvantageTypes.map((advType) => ({ label: advType.replace('antage', ''), value: advType }))}
              onChange={(ev: AdvantageType) => {
                AdvantageTypes.filter((advType) => advType !== ev).map((advType) => {
                  setShowAdvantageTypes({ [advType]: false });
                });
                setShowAdvantageTypes({ [ev]: true });
              }}
            />
          </div>
        </InputWrapper>
        )}
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
                mr="sm"
                mt="sm"
                compact
                variant="outline"
              >
                Feats & Special
              </Button>
            )}
          >
            <Switch label="Triggers PAM Bonus Action Attack Option" pt="sm" checked={factorPAM} onChange={() => toggleFactorPAM()} />
            <Switch label="Triggers GWM Bonus Action Attack Option" pt="sm" checked={factorGWM} onChange={() => toggleFactorGWM()} />
            <Switch label="Triggers First Hit effects" pt="sm" checked={triggersOnHit} onChange={(e) => setTriggersOnHit(e.currentTarget.checked)} />
            {/* <Switch label="Sharpshooter/Great Weapon Master" pt="sm" checked={powerAttack} onChange={() => togglePowerAttack()} /> */}
            {attackType === 'powerAttack' && <Switch label="Use SS/GWM only when optimal" pt="sm" checked={powerAttackOptimalOnly} onChange={() => togglePowerAttackOptimalOnly()} />}
          </Popover>

        </div>
        <Text weight="bold" mt="sm">Expected Damage</Text>
        <DamagerTable
          showAdvantageTypes={showAdvantageTypes}
          showAdvantageTypesDetails={showAdvantageTypeDetails}
          setShowAdvantageTypesDetails={setShowAdvantageTypeDetails}
          getDamageString={(advType: AdvantageType) => damageContext?.get(playerKey)?.get(damager.key)?.get(advType)?.get(target.ac)?.mean?.valueOf().toFixed(3) || ''}
          getDamageDetailsPMF={(advType: AdvantageType) => damageContext?.get(playerKey)?.get(damager.key)?.get(advType)?.get(target.ac)?.pmf}
          damager={damager}
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
