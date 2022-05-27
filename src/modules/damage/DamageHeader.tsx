import {
  ActionIcon, Burger, Grid, Header, Title,
} from '@mantine/core';
import { MoonStars, Sun } from 'tabler-icons-react';
import { NARROW_WIDTH } from '@damage/constants';
import React from 'react';

const DamageHeader = (props: { colorScheme: any, onClick: () => any, hideGraphs: any, onClick1: () => any, width: any }) => (
  <Header height={60} p="xs">
    <Grid>
      <Grid.Col span={4}>
        {/* <div */}
        {/*  style={{ */}
        {/*    display: "flex", */}
        {/*    alignItems: "center", */}
        {/*    height: "100%", */}
        {/*  }} */}
        {/* > */}
        <Title>
          Damage Calcs :)
        </Title>
      </Grid.Col>
      <Grid.Col span={4}>
        <ActionIcon
          variant="outline"
          color={
            props.colorScheme === 'light' ? 'yellow' : 'blue'
          }
          onClick={props.onClick}
          title="Toggle color scheme"
          mx="auto"
        >
          {props.colorScheme === 'light' ? (
            <Sun size={18} />
          ) : (
            <MoonStars size={18} />
          )}
        </ActionIcon>
      </Grid.Col>

      <Grid.Col span={4} style={{ display: 'flex' }}>
        <div style={{ flexGrow: 1 }} />

        <Burger
          opened={!props.hideGraphs}
          onClick={props.onClick1}
          size="sm"
          style={{ display: props.width > NARROW_WIDTH ? 'none' : 'block' }}
        />
      </Grid.Col>
      {/* </div> */}
    </Grid>
  </Header>
);
export default DamageHeader;
