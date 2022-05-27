import React from 'react';
import { dummyDamageData, dummyDamageDetails } from '@damage/damageData.hook';
import type { Player } from '@damage/types';
import type {
  DamageData, DamageDetails, PlayerList, playerListReducerAction,
} from '@pages/Damage';

export const DamageDataContext = React.createContext<DamageData>(dummyDamageData);
export const DamageDetailsContext = React.createContext<DamageDetails>(dummyDamageDetails);
export const SelectedPlayerContext = React.createContext<number>(0);
export const PlayerContext = React.createContext<Player | null>(null);
export const SetModalContext = React.createContext<(_: React.FC) => void>(() => {
});
export const DispatchPlayerListContext = React.createContext<React.Dispatch<playerListReducerAction> | null>(null);
export const InitialPlayerListContext = React.createContext<PlayerList>({});
