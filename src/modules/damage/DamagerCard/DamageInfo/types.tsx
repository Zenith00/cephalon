import type { AdvantageType, Damager } from '@damage/types';
import type React from 'react';
import type { SelectItem } from '@mantine/core';

export interface DamageInfoProps {
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
  attackModOptions: SelectItem[]
  setAttackModOptions: React.Dispatch<React.SetStateAction<SelectItem[]>>
  modRegex: RegExp,
  attackModSelected: string[]
  setAttackModSelected: React.Dispatch<React.SetStateAction<string[]>>
}
