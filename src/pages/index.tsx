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
  Image,
} from '@mantine/core';
import type { NextPage } from 'next';
import Head from 'next/head';
import { ArrowRightCircle } from 'tabler-icons-react';
import React from 'react';

interface PageInfo {
  title: string;
  imageURL: string
}

const pages: PageInfo[] = [
  { title: 'Condition Immunity', imageURL: '/img/ConditionImmunity.png' },
  { title: 'Damage Calculator', imageURL: 'img/Damage.png' },
];

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
          <Grid.Col span={6} key={page.title}>
            <Card shadow="sm" p="lg">
              <Text weight={500} align="center">
                {page.title}
              </Text>
              <Card.Section>
                <Image src={page.imageURL} height={260} />
              </Card.Section>
              <Center>
                <ActionIcon
                  variant="filled"
                  color="blue"
                  style={{ width: '50%' }}
                  mt="md"
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
