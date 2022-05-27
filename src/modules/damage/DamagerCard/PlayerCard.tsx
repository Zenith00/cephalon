import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  NumberInput,
  Paper,
  Popover,
  Select,
  Switch,
  Table,
  Title,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import type { Target } from '@pages/Damage';
import { PRESET_DAMAGERS } from '@damage/constants';
import { useToggle } from '@mantine/hooks';
import {
  CaretDown, CaretRight, Notes, Plus,
} from 'tabler-icons-react';
import type { AdvantageType } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import type { PMF } from '@utils/math';
import { convolve_pmfs_sum_2, weighted_mean_pmf, zero_pmf } from '@utils/math';
// import PAMGWMCard from '@damage/DamagerCard/PAMGWMCard';
import { DamageDetailsContext, DispatchPlayerListContext, PlayerContext } from '@damage/contexts';
import DamagerCard from './DamagerCard';

const MemoDamagerCard = React.memo(DamagerCard);

const PlayerCard = ({
  // player,
  // setPlayer,
  target,
}: {
  // player: Player;
  // setPlayer: React.Dispatch<playerListReducerAction>;
  target: Target;
}) => {
  const { colorScheme } = useMantineColorScheme();
  const darkTheme = colorScheme === 'dark';

  const [showAttacks, toggleShowAttacks_] = useToggle(true, [true, false]);
  const [attacksNeverCollapsed, setAttacksNeverCollapsed] = useState(true);
  const toggleShowAttacks = () => { setAttacksNeverCollapsed(false); toggleShowAttacks_(); };
  const [showTotalDamage, toggleShowTotalDamage] = useToggle(false, [true, false]);
  const [showAdvantageSettings, setShowAdvantageSettings] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dispatchPlayerList = useContext(DispatchPlayerListContext)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const player = useContext(PlayerContext)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const damageDetailsContext = useContext(DamageDetailsContext)!;

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
  const setShowAdvantageTypes: Record<AdvantageType, React.Dispatch<React.SetStateAction<boolean>>> = {
    advantage: setShowAdvantage,
    superadvantage: setShowSuperAdvantage,
    normal: setShowNeutral,
    disadvantage: setShowDisadvantage,
    superdisadvantage: setShowSuperDisadvantage,
  };
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // React.useEffect(() => {
  //   setTimeout(() => document.querySelectorAll('.mantine-collapse').forEach((x) => (x as HTMLElement).style.removeProperty('height')), 500);
  // }, []);

  return (
    <Paper shadow="xs" p="md" mt="md" sx={{ width: '100%' }} withBorder style={{ borderLeftColor: darkTheme ? 'orangered' : 'teal' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Title order={4}>PC Info</Title>
        <Box mr="sm" ml="auto" pt={8}>
          {/* <Checkbox label={"Show Damage"} /> */}
        </Box>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          // width: "100%",
        }}
      >
        <NumberInput
          label="Attack Bonus"
          step={1}
          value={player.attackBonus}
          style={{ width: '50%' }}
          onChange={(val) => dispatchPlayerList({
            field: 'attackBonus',
            val: val || 0,
            playerKey: player.key,
          })}
          formatter={(value) => {
            if (value) {
              const v = value.replace(/^\+/gi, '');
              return Number(v) > 0 ? `+${v}` : v;
            }
            return '';
          }}
        />
        <NumberInput
          label="Spell Save"
          step={1}
          value={player.spellSaveDC}
          style={{ width: '50%' }}
          onChange={(val) => dispatchPlayerList({
            field: 'spellSaveDC',
            val: val || 0,
            playerKey: player.key,
          })}
        />
      </div>
      <NumberInput
        label="Modifier (mod)"
        step={1}
        value={player.modifier}
        style={{ width: '50%' }}
        onChange={(val) => dispatchPlayerList({
          field: 'modifier',
          val: val || 0,
          playerKey: player.key,
        })}
        formatter={(value) => {
          if (value) {
            const v = value.replace(/^\+/gi, '');
            return Number(v) > 0 ? `+${v}` : v;
          }
          return '';
        }}
      />
      <Title order={4} py="sm">
        Special
      </Title>
      {/* <Checkbox label={"Elven Accuracy"} /> */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {/* <Checkbox label="Halfling Luck" /> */}
        {/* <Checkbox */}
        {/*  label="Polearm Master" */}
        {/*  onChange={(ev) => dispatchPlayerList({ */}
        {/*    field: 'TOGGLE_SPECIAL_PAM', playerKey: player.key, toggle: ev.currentTarget.checked, damagerType: 'pam', */}
        {/*  })} */}
        {/* /> */}
        {/* <Checkbox label="Great Weapon Master" /> */}
      </div>
      <UnstyledButton onClick={() => toggleShowAttacks()} pt="sm">
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {showAttacks ? <CaretDown /> : <CaretRight />}
          <Title order={3} pt="0">
            Attacks
          </Title>
        </div>
      </UnstyledButton>

      <Collapse in={showAttacks} style={{ height: undefined }} id="mantine-collapse-attacks">
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          {attacksNeverCollapsed
          && document.querySelectorAll('#mantine-collapse-attacks').forEach(
            (x) => (x as HTMLElement).style.removeProperty('height'),
          )}
        </>
        {Object.entries(player.damagers).map(([i, damager]) => (
          <MemoDamagerCard
            key={Number(i)}
            playerKey={player.key}
            damager={damager}
            target={target}
          />
        ))}

        <br />
        <Button
          mt={10}
          variant="outline"
          onClick={() => {
            dispatchPlayerList({ field: 'NEW_DAMAGER', playerKey: player.key });
          }}
        >
          New Attack
        </Button>
        <Popover
          opened={showPresetPicker}
          onClose={() => setShowPresetPicker(false)}
          target={(
            <Button
              variant="outline"
              mt={10}
              ml={5}
              color="cyan"
              onClick={(_: any) => setShowPresetPicker(true)}
            >
              Preset
            </Button>
          )}
        >
          <Select
            data={Object.keys(PRESET_DAMAGERS)}
            searchable
            onChange={(x) => {
              if (x) {
                dispatchPlayerList({
                  field: 'PRESET_DAMAGER',
                  playerKey: player.key,
                  newDamagerName: x as keyof typeof PRESET_DAMAGERS,
                });
              }
              // setCollapseState(true);
            }}
          />
        </Popover>
      </Collapse>

      <div style={{
        display: 'flex', alignItems: 'center', height: '100%', paddingTop: '10px',
      }}
      >
        <UnstyledButton onClick={() => toggleShowTotalDamage()}>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {showTotalDamage ? <CaretDown /> : <CaretRight />}
            <Title order={3} pt="0">
              Total Damage
            </Title>

          </div>
        </UnstyledButton>
        <Popover
          opened={showAdvantageSettings}
          onClose={() => setShowAdvantageSettings(false)}
          position="right"
          withArrow
          target={(
            <Button
              color="blue"
              variant="outline"
              onClick={() => setShowAdvantageSettings(true)}
              ml="md"
              mr="sm"
              size="sm"
              compact
            >
              <Plus size={20} />
            </Button>
            )}
        >
          {AdvantageTypes.map((advType) => (
            <Switch
              label={`Show ${advType[0].toUpperCase()}${advType.substr(1)}`}
              checked={showAdvantageTypes[advType]}
              onChange={(ev) => setShowAdvantageTypes[advType](ev.currentTarget.checked)}
            />
          ))}

        </Popover>
      </div>
      <Collapse
        in={showTotalDamage}
      >
        <Table>
          <tbody>
            {AdvantageTypes.filter(
              (advType) => showAdvantageTypes[advType],
            ).map(
              (advType) => (
                <tr>
                  <td>{advType}</td>
                  <td>
                    {weighted_mean_pmf(
                      [...damageDetailsContext.get(player.key)?.entries() || []]
                        .filter(([damagerKey, _]) => !player.damagers[damagerKey].disabled).map(([_, damager]) => damager)
                        .map((damageMap) => damageMap.get(advType))
                        .map((damageACMap) => damageACMap?.get(target.ac))
                        .filter((x):x is PMF => !!x)
                        .reduce((acc, n) => convolve_pmfs_sum_2(acc, n, true), zero_pmf()),
                    ).toString(3)}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </Table>
      </Collapse>
    </Paper>
  );
};

export default PlayerCard;
