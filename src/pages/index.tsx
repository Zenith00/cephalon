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
import Link from 'next/link';

interface PageInfo {
  title: string;
  imageURL: string;
  targetPageURL: string;
}

const pages: PageInfo[] = [
  { title: 'Condition Immunity', imageURL: '/img/ConditionImmunity.png', targetPageURL: '/ConditionImmunities' },
  { title: 'Damage Calculator', imageURL: 'img/Damage.png', targetPageURL: '/Damage' },
  { title: 'Couatl Spells', imageURL: 'img/Couatl.png', targetPageURL: '/Couatl' },
  { title: 'Saves by CR', imageURL: 'img/Saves.png', targetPageURL: '/Saves' },
  { title: 'Point Buy', imageURL: 'img/PointBuy.png', targetPageURL: '/PointBuy' },
  { title: 'To-Hits', imageURL: 'img/ToHit.png', targetPageURL: '/ToHits' },
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
      <Grid justify="center">
        {pages.map((page, index) => (
          <Grid.Col lg={6} md={8} key={page.title}>
            <Card shadow="sm" p="lg">
              <Text weight={500} align="center">
                {page.title}
              </Text>
              <Card.Section>
                <Image src={page.imageURL} height={260} />
              </Card.Section>
              <Center>
                <Link href={page.targetPageURL}>

                  <ActionIcon
                    variant="filled"
                    color="blue"
                    style={{ width: '50%' }}
                    mt="md"
                  >
                    <ArrowRightCircle />
                  </ActionIcon>
                </Link>

              </Center>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  </AppShell>
);

export default Home;
