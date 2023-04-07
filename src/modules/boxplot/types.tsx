import type { StringifiableRecord } from 'query-string';
import type { CREATURE_TYPES_WITH_ALL, SOURCES } from '@condition/constants';

export interface BoxplotFilter extends StringifiableRecord {
  sources: Partial<typeof SOURCES>;
  binSize: number,
  binLeft: boolean,
  crMin: number,
  crMax: number,
}
export interface SingleTypeFilter extends BoxplotFilter {
  creatureType: typeof CREATURE_TYPES_WITH_ALL[number],
  filterType: 'single'
}

export interface MultiTypeFilter extends BoxplotFilter {
  creatureTypes: typeof CREATURE_TYPES_WITH_ALL,
  filterType: 'multiple'
}
