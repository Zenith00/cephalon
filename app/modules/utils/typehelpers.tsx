import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export type Tuple<
  T,
  N extends number,
  R extends readonly T[] = [],
> = R['length'] extends N ? R : Tuple<T, N, readonly [T, ...R]>


interface Flavoring<FlavorT> {
  _type?: FlavorT;
}
