import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';

interface Flavoring<FlavorT> {
  _type?: FlavorT;
}
export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
