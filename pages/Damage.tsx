/* eslint-env browser */

import React, { useEffect, useReducer, useState } from 'react';
import type { ColorScheme } from '@mantine/core';
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Button,
  ColorSchemeProvider,
  Container,
  Footer,
  Grid,
  Group,
  Header,
  MantineProvider,
  Modal,
  Paper,
  Popover,
  Space,
  Text,
  Title,
} from '@mantine/core';
import Image from 'next/image';
import DamageGraphsAside from '@damage/DamageGraphs/DamageGraphsAside';
import { useRouter } from 'next/router';
import { gzip } from 'pako';
// import { ReactComponent as DiscordLogoBlack } from "/public/img/Discord-Logo-Black.svg";
// import DiscordLogoWhite from "/public/img/Discord-Logo-White.svg";
import { useDebouncedCallback } from 'use-debounce';
import { MoonStars, Sun } from 'tabler-icons-react';
import Head from 'next/head';
import { useToggle, useViewportSize } from '@mantine/hooks';
import PlayerCard from '@/damage/DamagerCard/PlayerCard';
import TargetNavbar from '@/damage/Target.navbar';
import { dummyDamageData, dummyDamageDetails, useHandleDamageData } from '@damage/damageData.hook';
import { NARROW_WIDTH, PRESET_DAMAGERS } from '@damage/constants';

import './Damage.module.css';
import type { PMF } from '@utils/math';
import type { AdvantageType, PlayerKey } from '@damage/types';
import { Damager, Player } from '@damage/types';

export interface Target {
  ac: number;
}

const PLAYER_FIELD_TO_SHORT: Record<keyof Player, string> = {
  key: 'k',
  attackBonus: 'a',
  spellSaveDC: 's',
  elvenAccuracy: 'e',
  battleMaster: 'b',
  damagers: 'd',
  critThreshold: 'c',
  modifier: 'm',
};
const PLAYER_SHORT_TO_FIELD = Object.fromEntries(
  Object.entries(PLAYER_FIELD_TO_SHORT).map(([k, v]) => [v, k]),
);

// console.log(PLAYER_SHORT_TO_FIELD);

// const PLAYER_FIELD_TO_SHORT = new Map(
//   [...PLAYER_SHORT_TO_FIELD.entries()].map(([k, v]) => [v, k])
// );

const DAMAGER_FIELD_TO_SHORT: Record<keyof Damager, string> = {
  damage: 'dmg',
  damageMean: 'dm',
  advantageShow: 'as',
  modifiers: 'm',
  modifierOptions: 'mo',
  modifierRaws: 'mr',
  atkBase: 'a',
  name: 'n',
  disabled: 'di',
  key: 'k',
  count: 'c',
  special: 's',
};

const DAMAGER_SHORT_TO_FIELD = Object.fromEntries(
  Object.entries(DAMAGER_FIELD_TO_SHORT).map(([k, v]) => [v, k]),
) as Record<string, keyof Damager>;

// const DAMAGER_FIELD_TO_SHORT = new Map(
//   [...DAMAGER_SHORT_TO_FIELD.entries()].map(([k, v]) => [v, k])
// );

function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return value;
}

function reviver(key: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (value.dataType === 'Map') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      return new Map(value.value);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return value;
}
export type DamageData = Map<
  number,
  Map<number, Map<AdvantageType, Map<number, number>>>
>;
export type DamageDetails = Map<
  number,
  Map<number, Map<AdvantageType, Map<number, PMF>>>
>;
export const DamageDataContext = React.createContext<DamageData>(dummyDamageData);
export const DamageDetailsContext = React.createContext<DamageDetails>(dummyDamageDetails);

export const SelectedPlayerContext = React.createContext<number>(0);
export const PlayerContext = React.createContext<Player | null>(null);
export const SetModalContext = React.createContext<(_: React.FC) => void>(
  () => {});

const MemoDamageGraphs = React.memo(DamageGraphsAside);

const MemoPlayerCard = React.memo(PlayerCard);

export type PlayerList = { [key: number]: Player };

export type playerListReducerFieldSet = (
  | {
      field: 'id';
      val: number;
    }
  | {
      field: 'attackBonus';
      val: number;
    }
  | {
    field: 'modifier';
    val: number;
  }
  | {
      field: 'spellSaveDC';
      val: number;
    }
  | {
      field: 'elvenAccuracy';
      val: boolean;
    }
  | {
      field: 'battleMaster';
      val: boolean;
    }
  | {
      field: 'damagers';
      val: { [key: number]: Damager };
    }
  | {
      field: 'critThreshold';
      val: number;
    }
) & { playerKey: number };

export type playerListReducerAction =
  | {
      field: 'OVERWRITE';
      val: PlayerList;
    }
  | {
      field: 'NEW_PLAYER'
    }
  | {
      field: 'NEW_DAMAGER';
      playerKey: number;
    }
  | {
      field: 'PRESET_DAMAGER';
      playerKey: number;
      newDamagerName: keyof typeof PRESET_DAMAGERS;
    }
  | {
      field: 'COPY_DAMAGER';
      playerKey: PlayerKey;
      newDamager: Damager;
    }
  | {
      field: 'UPDATE_DAMAGER';
      playerKey: number;
      damagerKey: number;
      newDamager: Damager;
    }
  | { field: 'DELETE_DAMAGER'; playerKey: number; damagerKey: number }
  | playerListReducerFieldSet;
export const DispatchPlayerList = React.createContext<React.Dispatch<playerListReducerAction> | null>(null);
export const InitialPlayerListContext = React.createContext<PlayerList>({});

const transformPlayerList = (p: PlayerList, inflate: boolean) => {
  // console.log(p);
  const PLAYER_MAP = inflate ? PLAYER_SHORT_TO_FIELD : PLAYER_FIELD_TO_SHORT;
  const DAMAGER_MAP = inflate ? DAMAGER_SHORT_TO_FIELD : DAMAGER_FIELD_TO_SHORT;
  const DAMAGERS_KEY = inflate ? 'damagers' : 'd';
  return Object.fromEntries(
    [...Object.entries(p)].map(([playerIndex, player]) => [
      playerIndex,
      Object.fromEntries(
        Object.entries(player).map(([playerField, playerValue]) => {
          if (['damagers', 'd'].includes(playerField)) {
            return [
              DAMAGERS_KEY,
              Object.fromEntries(
                Object.entries(playerValue as { [key: number]: Damager }).map(
                  ([damagerIndex, damager]) => [
                    damagerIndex,
                    Object.fromEntries(
                      Object.entries(damager).map(
                        ([damagerKey, damagerVal]) => [
                          DAMAGER_MAP[damagerKey as keyof Damager],
                          damagerVal,
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ];
          }
          return [PLAYER_MAP[playerField], playerValue];
        }),
      ),
    ]),
  );
};

function Damage() {
  const router = useRouter();
  const [hideGraphs, setHideGraphs] = useState(false);
  const { height, width } = useViewportSize();
  console.log(width);
  const playerListReducer = (
    state: { [key: number]: Player },
    action: playerListReducerAction,
  ): PlayerList => {
    console.log(state);
    console.log(action);
    // console.log(state);
    // console.log(action);
    const getNextDamagerIndex = (playerKey: number) => Math.max(
      ...Object.keys(state[playerKey].damagers).map((i) => Number(i)),
      -1,
    ) + 1;

    if (action.field === 'OVERWRITE') {
      return action.val;
    } if (action.field === 'UPDATE_DAMAGER') {
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [action.damagerKey]: action.newDamager,
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } if (action.field === 'NEW_PLAYER') {
      const nextPlayerIndex = Math.max(...Object.keys(state).map((i) => Number(i)), -1) + 1 as PlayerKey;
      return { ...state, [nextPlayerIndex]: new Player(nextPlayerIndex) };
    } if (action.field === 'NEW_DAMAGER') {
      const nextDamagerIndex = getNextDamagerIndex(action.playerKey);
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [nextDamagerIndex]: new Damager(nextDamagerIndex),
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } if (action.field === 'PRESET_DAMAGER') {
      const nextDamagerIndex = getNextDamagerIndex(action.playerKey);
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [nextDamagerIndex]:
          PRESET_DAMAGERS[action.newDamagerName](nextDamagerIndex),
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } if (action.field === 'COPY_DAMAGER') {
      const nextDamagerIndex = getNextDamagerIndex(action.playerKey);
      const newDamagers = {
        ...state[action.playerKey].damagers,
        [nextDamagerIndex]: { ...action.newDamager, key: nextDamagerIndex },
      };
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: newDamagers,
        },
      };
    } if (action.field === 'DELETE_DAMAGER') {
      return {
        ...state,
        [action.playerKey]: {
          ...state[action.playerKey],
          damagers: Object.fromEntries(
            Object.entries(state[action.playerKey].damagers).filter(
              ([k, v]) => parseInt(k) !== action.damagerKey,
            ),
          ),
        },
      };
    }
    return {
      ...state,
      [action.playerKey]: {
        ...state[action.playerKey],
        [action.field]: action.val,
      },
    };
  };

  const [playerList, dispatchPlayerList] = useReducer(playerListReducer, {
    0: {
      attackBonus: 7,
      spellSaveDC: 14,
      key: 0,
      elvenAccuracy: false,
      battleMaster: false,
      damagers: [new Damager(0)],
      critThreshold: 20,
      modifier: 0,
    },
  } as { [key: number]: Player });

  const [initialPlayerList, setInitialPlayerList] = useState<PlayerList>({});

  const { damageData, damageDetails } = useHandleDamageData(playerList);

  const [selectedPlayerKey, setSelectedPlayerKey] = useState(0);

  const [uri, setUri] = useState('');

  const [target, setTarget] = useState<Target>({ ac: 14 });

  const [playerInfoDisplay, setPlayerInfoDisplay] = useState('block');

  useEffect(() => {
    if (width < NARROW_WIDTH) {
      setPlayerInfoDisplay(hideGraphs ? 'block' : 'none');
    } else {
      setPlayerInfoDisplay('block');
    }
  }, [width]);

  const debouncedUpdateURI = useDebouncedCallback(() => {
    setUri(
      `${location.href.replace(location.search, '')}?d=${Buffer.from(
        JSON.stringify(transformPlayerList(playerList, false), replacer),
      ).toString('base64')}`,
    );
  }, 1000);

  useEffect(() => {
    debouncedUpdateURI();
  }, [playerList]);

  const setData = React.useCallback((data) => {
    if (data) {
      // console.log(data);
      const d = Buffer.from(data, 'base64').toString();
      const newPlayerList = transformPlayerList(
        JSON.parse(d, reviver),
        true,
      ) as PlayerList;
      dispatchPlayerList({
        field: 'OVERWRITE',
        val: newPlayerList,
      });
      setInitialPlayerList(newPlayerList);
    } else {
      setInitialPlayerList(playerList);
    }
  }, []);

  useEffect(() => {
    const shortKey = decodeURIComponent(
      new URLSearchParams(document.location.search).get('s') || '',
    );

    if (shortKey) {
      fetch(`https://s.cephalon.xyz/${shortKey}`, {
        method: 'GET',
        mode: 'cors',
      })
        .then((r) => {
          r.text().then((t) => {
            // console.log("GOT ");
            // console.log(t);
            setData(t);
          }).catch(() => { /* ignore */ });
        })
        .catch(() => {
          window.location.assign('/Damage');
        });
    } else {
      const data = decodeURIComponent(
        new URLSearchParams(document.location.search).get('d') || '',
      );
      setData(data);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modalContent, setModalContent] = useState<
    React.FC | React.ReactElement
  >();
  const [modalOpen, setModalOpen] = useState(false);
  const setModalContentWrapper = (mc: React.FC) => {
    // console.log("setting modal");
    // console.log(modalContent);
    setModalContent(mc);
    setModalOpen(true);
  };

  const [showCopyPopup, setShowCopyPopup] = useState(false);

  const submitURL = async () => {
    const graphSVG = document.getElementById('damageChart')?.children[1].children[0];
    if (!graphSVG) {
      return;
    }
    const dataUrl = new XMLSerializer().serializeToString(graphSVG);

    const legendXOffset = 20;
    let legendYOffset = 10;
    let legendWidthFactor = 0;
    const t = [
      ...(document.getElementById('damageChartLegend')?.children[0].children
        || []),
    ].map((x) => {
      const [color, name] = x.children;
      const nameText = (name as HTMLElement).innerText;
      legendWidthFactor = Math.max(legendWidthFactor, nameText.length);
      const colorFill = color.children[0].getAttribute('fill');
      const ydex = (legendYOffset += 15);
      return `<rect x="5" y="${ydex}" fill="${colorFill}" width="10" height="10"></rect> <text  x="${legendXOffset}" y="${
        ydex + 4
      }" >${nameText}</text>`;
    });
    const legend = `<svg xmlns="http://www.w3.org/2000/svg" width="${
      (legendWidthFactor * 25) ** 0.85
    }" height="${graphSVG.getAttribute(
      'height',
    )}">   <style><![CDATA[text{ dominant-baseline: middle; font: 12px Verdana, Helvetica, Arial, sans-serif;  } svg{background-color: white}]]></style>
    ${t.join('\n')}
    </svg>`;

    await fetch('https://s.cephalon.xyz', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
      body: gzip(
        JSON.stringify({
          image: dataUrl,
          legend,
          datahash: uri.split('Damage?d=')[1],
        }),
      ),
    }).then((r) => r.text().then((shortHash) => {
      router.replace({
        query: {
          s: shortHash,
        },
      });
      // setUri(`${location.href.replace(location.search, "")}?s=${shortHash}`);
      navigator.clipboard.writeText(
        `${window.location.href.replace(window.location.search, '')}?s=${shortHash}`,
      );
      setShowCopyPopup(true);
      setTimeout(() => setShowCopyPopup(false), 850);
    }));
  };
  // const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [colorScheme, toggleColorScheme] = useToggle<ColorScheme>('light', ['dark', 'light']);

  // const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  return (
    <>
      <Head>
        <meta property="REWRITE_ANCHOR" />
        <meta property="REWRITE_ANCHOR_URL" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="og:title" content="Damage Graphs" />
      </Head>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider theme={{ colorScheme }} withGlobalStyles>
          <DamageDataContext.Provider value={damageData}>
            <DamageDetailsContext.Provider value={damageDetails}>
              <InitialPlayerListContext.Provider value={initialPlayerList}>
                <DispatchPlayerList.Provider value={dispatchPlayerList}>
                  <SelectedPlayerContext.Provider value={selectedPlayerKey}>
                    <Modal opened={modalOpen} onClose={() => setModalOpen(false)}>
                      {modalContent}
                    </Modal>
                    <AppShell
                    // fixed
                    // styles={{
                    //   body: { height: "90%" },
                    //   root: { height: "99vh" },
                    // }}
                      padding={0}
                    // padding="md"
                      navbar={
                        <TargetNavbar target={target} setTarget={setTarget} />
                    }
                      aside={(
                        <SetModalContext.Provider value={setModalContentWrapper}>
                          <MemoDamageGraphs
                            player={playerList[selectedPlayerKey]}
                            target={target}
                            hidden={hideGraphs}
                          />
                        </SetModalContext.Provider>
                    )}
                      zIndex={1}
                      style={{ isolation: 'isolate' }}
                      header={(
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
                                colorScheme === 'light' ? 'yellow' : 'blue'
                              }
                                onClick={() => toggleColorScheme()}
                                title="Toggle color scheme"
                                mx="auto"
                              >
                                {colorScheme === 'light' ? (
                                  <Sun size={18} />
                                ) : (
                                  <MoonStars size={18} />
                                )}
                              </ActionIcon>
                            </Grid.Col>

                            <Grid.Col span={4} style={{ display: 'flex' }}>
                              <div style={{ flexGrow: 1 }} />

                              <Burger
                                opened={!hideGraphs}
                                onClick={() => setHideGraphs((o) => !o)}
                                size="sm"
                                style={{ display: width > NARROW_WIDTH ? 'none' : 'block' }}
                              />
                            </Grid.Col>
                            {/* </div> */}
                          </Grid>
                        </Header>
                    )}
                      footer={(
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
                                  opened={showCopyPopup}
                                  position="top"
                                  withArrow
                                  style={{ width: '100%' }}
                                  target={(
                                    <Button
                                      compact
                                      onClick={() => {
                                        submitURL();
                                      }}
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
                    )}
                    >
                      <Paper
                        style={{
                          width: '100%',
                          height: '100%',
                          // maxWidth: width > NARROW_WIDTH ? '35vw' : '100vw',
                          // eslint-disable-next-line no-nested-ternary
                          display: playerInfoDisplay,
                        }}
                      // p={0}
                        p="sm"
                        radius={0}
                      >
                        {/* <Paper> */}
                        <Title order={3}>
                          Attacks
                        </Title>
                        <Space h={3} />

                        {Object.entries(initialPlayerList).length
                        && Object.entries(playerList).map(([index, player]) => (
                          <PlayerContext.Provider value={player} key={index}>
                            <MemoPlayerCard key={index} target={target} />
                          </PlayerContext.Provider>
                        ))}
                        <Button onClick={() => { dispatchPlayerList({ field: 'NEW_PLAYER' }); }}>
                          New Player
                        </Button>
                      </Paper>
                    </AppShell>
                  </SelectedPlayerContext.Provider>
                </DispatchPlayerList.Provider>
              </InitialPlayerListContext.Provider>
            </DamageDetailsContext.Provider>
          </DamageDataContext.Provider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

export default Damage;
