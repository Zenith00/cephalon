import React, { useContext, useState } from 'react';
import {
  Box, Button, Checkbox, NumberInput, Paper, Popover, Select, Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { Target } from '@pages/Damage';
import { DispatchPlayerList, PlayerContext } from '@pages/Damage';
import { PRESET_DAMAGERS } from '@damage/constants';
import DamagerCard from './DamagerCard';

const MemoDamagerCard = React.memo(DamagerCard);

function PlayerCard({
  // player,
  // setPlayer,
  target,
}: {
  // player: Player;
  // setPlayer: React.Dispatch<playerListReducerAction>;
  target: Target;
}) {
  const form = useForm({
    initialValues: {
      email: '',
      termsOfService: false,
    },

    validate: {
      email: (value) => true,
    },
  });

  const dispatchPlayerList = useContext(DispatchPlayerList)!;
  const player = useContext(PlayerContext)!;
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  return (
    <Paper shadow="xs" p="md" mt="md" sx={{ width: '100%' }} withBorder>
      <Box mx="auto">
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
        <Checkbox label="Halfling Luck" />

        <Title order={3} pt="md">
          Attacks
        </Title>
        {Object.entries(player.damagers).map(([i, damager]) => (
          <MemoDamagerCard
            key={Number(i)}
            playerKey={player.key}
            damager={damager}
            target={target}
          />
        ))}
        <Button
          mt={10}
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
            onChange={(x) => x
              && dispatchPlayerList({
                field: 'PRESET_DAMAGER',
                playerKey: player.key,
                newDamagerName: x as keyof typeof PRESET_DAMAGERS,
              })}
          />
        </Popover>
      </Box>
    </Paper>
  );
}

export default PlayerCard;
