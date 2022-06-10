import type { AdvantageType } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import React, { useState } from 'react';
import { Button, Popover, Switch } from '@mantine/core';
import { Plus } from 'tabler-icons-react';
import type { SetState } from '@common';

const AdvantageShow = (
  {
    showAdvantageTypes,
    setShowAdvantageTypes,
  }:
    {
      showAdvantageTypes: Record<AdvantageType, boolean>,
      setShowAdvantageTypes: SetState<Partial<Record<AdvantageType, boolean | undefined>>>
    },
) => {
  const [settingsPopover, setSettingsPopover] = useState(false);
  return (
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
          onChange={(ev) => {
            setShowAdvantageTypes({ [advType]: ev.currentTarget.checked });
          }}
        />
      ))}
    </Popover>
  );
};
export default AdvantageShow;
