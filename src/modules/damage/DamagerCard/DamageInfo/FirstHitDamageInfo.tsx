import type { SelectItem } from '@mantine/core';
import {
  Button, MultiSelect, NumberInput, Popover, Switch, TextInput, Tooltip,
} from '@mantine/core';
import { InfoCircle, Plus } from 'tabler-icons-react';
import type { Damager, AdvantageType } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import React, { useContext, useEffect, useState } from 'react';
import type { DamageInfoProps } from '@damage/DamagerCard/DamageInfo/types';
import { PlayerContext } from '@damage/contexts';
import type { SetState } from '@common';

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
  attackModOptions,
  setAttackModOptions,
  modRegex,
  attackModSelected,
  setAttackModSelected,
} : DamageInfoProps) => {
  const [settingsPopover, setSettingsPopover] = useState(false);
  const [attackModPlaceholder, setAttackModPlaceholder] = useState('');
  const [attackModError, setAttackModError] = useState(false);
  const [atkModId, setAtkModId] = useState(3);
  const player = useContext(PlayerContext);

  const getAtkModID = () => {
    const i = atkModId;
    setAtkModId(i + 1);
    return (i + 1).toString();
  };

  useEffect(() => {
    setDamagerCount(Object.values(player?.damagers ?? {}).filter((d) => d.flags.triggersFirstHit).reduce((acc, n) => acc + n.count, 0));
  }, [player?.damagers, setDamagerCount]);

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
    <>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <TextInput
          label={`Name: ${damager.key}`}
          placeholder="Eldritch Blast"
          value={damagerName}
          style={{ width: '100%' }}
          onChange={(ev) => setDamagerName(ev.currentTarget.value)}
        />
        <Button onClick={() => toggleDisabled()} mt={27} ml={2} mr={0} color={disabled ? 'red' : 'blue'}>
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
              ml={2}
              mr="sm"
              mt={27}
              variant="outline"
            >
              <Plus />
            </Button>
            )}
        >
          {AdvantageTypes.map((advType) => (
            <Switch
              key={advType}
              label={`Show ${advType}`}
              checked={showAdvantageTypes[advType]}
              onChange={(ev) => setShowAdvantageTypes({...showAdvantageTypes, [advType]: ev.currentTarget.checked})}
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
          style={{ width: '60%' }}
        />

        <TextInput
          label="Triggering Attacks"
          // onChange={(c) => setDamagerCount(c || 1)}
          value={damagerCount}
          style={{ width: '40%' }}
          mr="xs"
          sx={{ '& input': { cursor: 'default', readonly: true } }}
          onMouseDown={(e) => e.preventDefault()}
        />
      </div>
      {/* <MultiSelect */}
      {/*  data={attackModOptions} */}
      {/*  creatable */}
      {/*    // ref={ref as MutableRefObject<HTMLInputElement>} */}
      {/*  label={( */}
      {/*    <div */}
      {/*      style={{ display: 'flex', alignItems: 'center', height: '100%' }} */}
      {/*    > */}
      {/*      Attack Modifiers */}
      {/*      <Tooltip */}
      {/*        label="Examples: 1d4, +1d4, -1d4, CustomName [+1d4]" */}
      {/*        pl={4} */}
      {/*        mt={4} */}
      {/*      > */}
      {/*        <InfoCircle size={16} /> */}
      {/*      </Tooltip> */}
      {/*    </div> */}
      {/*    )} */}
      {/*  error={attackModError} */}
      {/*  searchable */}
      {/*  clearable */}
      {/*  getCreateLabel={(query) => (query.match(modRegex) */}
      {/*    ? `+ Add ${query}` */}
      {/*    : '+-1dX or Name [+-1dX]')} */}
      {/*  placeholder={attackModPlaceholder} */}
      {/*  onCreate={(query) => { */}
      {/*    if (!query.match(modRegex)) { */}
      {/*      setAttackModError(true); */}
      {/*      setAttackModPlaceholder('Invalid Format'); */}
      {/*      setTimeout(() => { */}
      {/*        setAttackModError(false); */}
      {/*        setAttackModPlaceholder(''); */}
      {/*      }, 1500); */}
      {/*    } */}
      {/*  }} */}
      {/*  onChange={onUpdateAttackMods} */}
      {/*  value={attackModSelected} */}
      {/* /> */}
    </>
  );
};

export default RegularDamageInfo;
