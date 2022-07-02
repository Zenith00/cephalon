import type React from 'react';
import { useEffect, useState } from 'react';
import type { AdvantageType } from '@damage/types';
import type { SetState } from '@utils/typehelpers';

const AdvantageSelect = (neutralDefault = true) => {
  const [showSuperAdvantage, setShowSuperAdvantage] = useState(false);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showNeutral, setShowNeutral] = useState(neutralDefault);
  const [showDisadvantage, setShowDisadvantage] = useState(false);
  const [showSuperDisadvantage, setShowSuperDisadvantage] = useState(false);
  const showAdvantageTypes: Record<AdvantageType, boolean> = {
    advantage: showAdvantage,
    superadvantage: showSuperAdvantage,
    normal: showNeutral,
    disadvantage: showDisadvantage,
    superdisadvantage: showSuperDisadvantage,
  };
  const setShowAdvantageTypes: Record<AdvantageType, SetState<boolean>> = {
    advantage: setShowAdvantage,
    superadvantage: setShowSuperAdvantage,
    normal: setShowNeutral,
    disadvantage: setShowDisadvantage,
    superdisadvantage: setShowSuperDisadvantage,
  };

  return [showAdvantageTypes, setShowAdvantageTypes] as [typeof showAdvantageTypes, typeof setShowAdvantageTypes];
};

export default AdvantageSelect;
