import {
  Button, NumberInput, Popover, Switch, TextInput,
} from '@mantine/core';
import { Notes } from 'tabler-icons-react';
import type { Damager, AdvantageType } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import React, { useState } from 'react';

type regularDamageInfoProps = {
  damager: Damager,
  disabled: boolean,
  toggleDisabled: (_?: (React.SetStateAction<boolean> | undefined)) => void
  damagerName: string,
  setDamagerName: React.Dispatch<React.SetStateAction<string>>,
  showAdvantageTypes: Record<AdvantageType, boolean>
  setShowAdvantageTypes: Record<AdvantageType, React.Dispatch<React.SetStateAction<boolean>>>
  damagerDamage: string,
  setDamagerDamage: React.Dispatch<React.SetStateAction<string>>,
  damagerCount: number,
  setDamagerCount: React.Dispatch<React.SetStateAction<number>>,
};

const RegularDamageInfo = ({
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
} : regularDamageInfoProps) => {
  const [settingsPopover, setSettingsPopover] = useState(false);
  const [attackModPlaceholder, setAttackModPlaceholder] = useState('');
  const [attackModError, setAttackModError] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <TextInput
          label={`Name: ${damager.key}`}
          placeholder="Eldritch Blast"
          value={damagerName}
          style={{ width: '100%' }}
          onChange={(ev) => setDamagerName(ev.currentTarget.value)}
        />
        <Button onClick={() => toggleDisabled()} mt={27} ml="sm" color={disabled ? 'red' : 'blue'}>
          {disabled ? 'Disabled' : 'Enabled'}
        </Button>
        <Popover
          opened={settingsPopover}
          onClose={() => setSettingsPopover(false)}
          position="right"
          withArrow
          target={(
            <Button
              color="blue"
              onClick={() => setSettingsPopover(true)}
              ml="sm"
              mr="sm"
              mt={27}
              variant="outline"
            >
              <Notes />
            </Button>
            )}
        >
          {AdvantageTypes.map((advType) => (
            <Switch
              label={`Show ${advType}`}
              checked={showAdvantageTypes[advType]}
              onChange={(ev) => setShowAdvantageTypes[advType](ev.currentTarget.checked)}
            />
          ))}
        </Popover>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <TextInput
          label="Damage"
          value={damagerDamage}
          placeholder="1d10+mod"
          onChange={(ev) => setDamagerDamage(ev.currentTarget.value)}
          style={{ width: '70%' }}
        />
        <NumberInput
          label="Attack Count"
          onChange={(c) => setDamagerCount(c || 1)}
          value={damagerCount}
          ml="sm"
          style={{ width: '30%' }}
          mr="xs"
        />
      </div>
    </>
  );
};

export default RegularDamageInfo;
