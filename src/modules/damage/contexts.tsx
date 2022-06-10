import React from 'react';
import { dummyDamageData } from '@damage/damageData.hook';
import type { Player, PlayerKey } from '@damage/types';
import type { DamageData, PlayerList, playerListReducerAction } from '@pages/Damage';

export const DamageDataContext = React.createContext<DamageData>(dummyDamageData);
export const SelectedPlayerContext = React.createContext<PlayerKey>(0);
export const PlayerContext = React.createContext<Player | null>(null);
export const SetModalContext = React.createContext<(_: React.FC) => void>(() => {
});
export const DispatchPlayerListContext = React.createContext<React.Dispatch<playerListReducerAction> | null>(null);
export const InitialPlayerListContext = React.createContext<PlayerList>({});
export const AdvancedModeContext = React.createContext<boolean>(false);
