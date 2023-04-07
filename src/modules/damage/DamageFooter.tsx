import {
  Button, Container, Footer, Group, Popover, Text,
} from '@mantine/core';
import React from 'react';
import DiscordLink from '@common/DiscordLink.component';

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
          <DiscordLink colorScheme={colorScheme} />
        </Group>
      </Container>

      {/* </UnstyledButton> */}
    </Footer>
  );
};

export default DamageFooter;
