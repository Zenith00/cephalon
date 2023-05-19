import type { NumberInputProps } from '@mantine/core';
import { NumberInput } from '@mantine/core';
import React, { useRef } from 'react';

const WheelNumberInput = (props: NumberInputProps) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <NumberInput
      {...props}
      ref={ref}
      onWheel={(ev: React.WheelEvent<HTMLInputElement>) => {
        const { onWheel } = props;
        ref.current?.blur();
        onWheel?.(ev);
      }}
    />
  );
};

export default WheelNumberInput;
