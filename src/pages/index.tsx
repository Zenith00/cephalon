import {
  ActionIcon,
  AppShell,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Header,
  Navbar,
  Text,
  Title,
} from '@mantine/core';
import type { NextPage } from 'next';
import Head from 'next/head';
import { ArrowRightCircle } from 'tabler-icons-react';
import React from 'react';

interface PageInfo {
  title: string;
}

const pages: PageInfo[] = [{ title: 'Condition Immunity' }];

const Home: NextPage = () => (
  <AppShell
    header={(
      <Header height={60} p="sm">
        <Title order={2}>Cephalon</Title>
      </Header>
      )}
    padding={20}
  >
    <Container size="xl">
      <Grid>
        {pages.map((page, index) => (
          <Grid.Col span={6} key={index}>
            <Card shadow="sm" p="lg">
              <Text weight={500} align="center">
                {page.title}
              </Text>
              <Center>
                <ActionIcon
                  variant="filled"
                  color="blue"
                  style={{ width: '50%' }}
                >
                  <ArrowRightCircle />
                </ActionIcon>
              </Center>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  </AppShell>
);

export default Home;
