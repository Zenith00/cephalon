import type { CSSProperties } from 'react';

export type NodeLabelTypes = 'player' | 'target' | 'damager' | 'onHit';

export const NodeTypeStyle : Record<NodeLabelTypes, CSSProperties> = {
  player: { borderColor: 'white', background: 'teal', width: '4.3em' },
  target: { borderColor: 'white', background: 'grey', width: '4.3em' },
  damager: { borderColor: 'white', background: 'orangered', width: '5.4em' },
  onHit: {
    borderColor: 'white', background: 'blue', width: '4.5em',
  },
};

export interface NodeTypeDatum {
  label: string,
  transform?: string
}

export const NodeTypeData : Record<NodeLabelTypes, NodeTypeDatum > = {
  player: { label: 'Player' },
  target: { label: 'Target' },
  damager: { label: 'Damage' },
  onHit: { label: 'On Hit', transform: 'translateY(20px)' },
};
