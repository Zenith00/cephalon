import React, { useContext } from 'react';
import { DamageDataContext, PlayerContext, SelectedPlayerContext } from '@damage/contexts';
import { ScrollArea, Table } from '@mantine/core';
import type { AC, AdvantageType, DamageInfo } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import { ACs } from '@damage/constants';

const DamageDetails = () => {
  const damageContext = useContext(DamageDataContext)!;
  const selectedPlayerContext = useContext(SelectedPlayerContext)!;
  const playerContext = useContext(PlayerContext)!;

  const getDataRows = (damageData: Map<AdvantageType, Map<AC, DamageInfo>>) => ACs.map((ac) => (
    <tr key={ac}>
      <td>{ac}</td>
      {AdvantageTypes.map((advType) => <td>{damageData?.get(advType)?.get(ac)?.mean?.toString(3)}</td>)}
    </tr>
  ));

  return (

    <ScrollArea style={{
      height: '100%', width: '100%', display: 'block',
    }}
    >

      <Table style={{ display: 'block', height: '100%' }}>
        <thead>
          <tr>
            <th>AC</th>
            {AdvantageTypes.map((advType) => <th>{advType}</th>)}
          </tr>
        </thead>
        <tbody>{[...damageContext.get(selectedPlayerContext)?.entries() || []].map(([damagerKey, damager]) => getDataRows(damager))}</tbody>
      </Table>

    </ScrollArea>
  );
};

export default DamageDetails;
