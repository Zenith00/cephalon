import {
  ActionIcon,
  AppShell,
  Card,
  Center,
  Container,
  Grid,
  Header,
  Image,
  Text,
  Title
} from '@mantine/core';
import { Link } from "@remix-run/react";
import { IconArrowRightCircle } from '@tabler/icons-react';

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

const Home = () => (
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
                <Link to={page.targetPageURL}>

                  <ActionIcon
                    variant="filled"
                    color="blue"
                    style={{ width: '50%' }}
                    mt="md"
                  >
                    <IconArrowRightCircle />
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
