import {
  Badge, Button, Container, Footer, Group, Popover, Text,
} from '@mantine/core';
import Image from 'next/image';
import React from 'react';

const DamageFooter = (props: { opened: boolean, onClick: () => void, colorScheme: 'dark' | 'light' }) => {
  const { opened, onClick, colorScheme } = props;
  return (
    <Footer height={30}>
      <Container
        mx={0}
        px={10}
        py={2}
        style={{
          width: '100%',
          maxWidth: '100%',
          alignItems: 'center',
        }}
      >
        {/* <div></div> */}
        <Group style={{ width: '100%', height: 25 }} grow>
          {/* Share: */}
          <div style={{ width: '20%' }} />
          <div style={{ height: '100%', width: '50%' }}>
            <Popover
              opened={opened}
              position="top"
              withArrow
              style={{ width: '100%' }}
              target={(
                <Button
                  compact
                  onClick={onClick}
                  style={{ width: '100%' }}
                >
                  Share
                </Button>
              )}
            >
              <Text size="sm">Copied!</Text>
            </Popover>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1 }} />
            <Badge
              mr="sm"
              style={{
                cursor: 'pointer',
                width: 150,
              }}
              component="a"
              href="https://discord.com/invite/dndnext"
              variant="outline"
            >
              <div>
                {colorScheme === 'dark' ? (
                  <Image
                    src="/img/Discord-Logo-White.svg"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src="/img/Discord-Logo-Black.svg"
                    width={20}
                    height={20}
                  />
                )}
              </div>
              Made with 💖
            </Badge>
          </div>
        </Group>
      </Container>

      {/* </UnstyledButton> */}
    </Footer>
  );
};

export default DamageFooter;
