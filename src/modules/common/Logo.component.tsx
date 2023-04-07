import { Badge } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Logo = ({ colorScheme }: {colorScheme:'dark' | 'light' }) => (
  <div style={{ display: 'flex' }}>
    <Badge
      mr="sm"
      style={{
        cursor: 'pointer',
        width: 150,
        height: 30,
      }}
      component="a"
      variant="outline"
    >
      <Link href="/">
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {colorScheme === 'dark' ? (
            <Image
              src="/img/LogoWhite.png"
              width={24}
              height={24}
            />
          ) : (
            <Image
              src="/img/LogoBlack.png"
              width={24}
              height={24}
            />
          )}
          <p style={{ paddingLeft: '8px', fontSize: '1.3em' }}>
            Cephalon
          </p>

        </div>
      </Link>

    </Badge>
  </div>
);
export default Logo;
