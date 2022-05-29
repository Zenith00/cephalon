import type { AdvantageType } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import { Popover, Table, Text } from '@mantine/core';
import type { PMF } from '@utils/math';
import type Fraction from 'fraction.js';
import React from 'react';
import type { SetState } from '@common';

type damagerTableProps = {
  showAdvantageTypes: Record<AdvantageType, boolean>,
showAdvantageTypesDetails: Record<AdvantageType, boolean>
  setShowAdvantageTypesDetails: Record<AdvantageType, SetState<boolean>>
  getDamageString: (_: AdvantageType) => string,
  getDamageDetailsPMF: (_: AdvantageType) => PMF | undefined
}

const DamagerTable = ({
  showAdvantageTypes, showAdvantageTypesDetails, setShowAdvantageTypesDetails, getDamageString, getDamageDetailsPMF,
}: damagerTableProps) => (
  <Table>
    <tbody>
      {(AdvantageTypes).map((advType) => showAdvantageTypes[advType]
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
                    <Text variant="link" onClick={() => setShowAdvantageTypesDetails[advType](true)}>{getDamageString(advType)}</Text>)}
                >
                  <Table>
                    <tbody>
                      <tr>
                        <th>Damage</th>
                        <th>Chance</th>
                      </tr>
                      {([...getDamageDetailsPMF(advType)?.entries() || []] as [number, Fraction][]).sort(([aK, _aV], [bK, _bV]) => aK - bK).map(
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
  </Table>
);
export default DamagerTable;
