import type { AdvantageType, Damager } from '@damage/types';
import type React from 'react';
import type { SelectItem } from '@mantine/core';
import type { SetState } from '@utils/typehelpers';

export interface DamageInfoProps {
  damager: Damager,
  disabled: boolean,
  toggleDisabled: (_?: (React.SetStateAction<boolean> | undefined)) => void
  damagerName: string,
  setDamagerName: SetState<string>,
  showAdvantageTypes: Record<AdvantageType, boolean>
  setShowAdvantageTypes: SetState<Partial<Record<AdvantageType, boolean | undefined>>>
  damagerDamage: string,
  setDamagerDamage: SetState<string>,
  damagerCount: number,
  setDamagerCount: SetState<number>,
  attackModOptions: SelectItem[]
  setAttackModOptions: SetState<SelectItem[]>
  modRegex: RegExp,
  attackModSelected: string[]
  setAttackModSelected: SetState<string[]>
}
