/* eslint-env browser */

import React, { useEffect, useReducer, useState } from 'react';
import type { ColorScheme } from '@mantine/core';
import {
  AppShell, Button, ColorSchemeProvider, MantineProvider, Modal, Paper, Space, Title,
} from '@mantine/core';
import DamageGraphsAside from '@damage/DamageGraphs/DamageGraphsAside';
import { useRouter } from 'next/router';
import { gzip } from 'pako';

import { useDebouncedCallback } from 'use-debounce';
import Head from 'next/head';
import { useToggle, useViewportSize } from '@mantine/hooks';
import PlayerCard from '@/damage/DamagerCard/PlayerCard';
import TargetNavbar from '@damage/TargetNavbar';
import { useHandleDamageData } from '@damage/damageData.hook';
import { NARROW_WIDTH, PRESET_DAMAGERS } from '@damage/constants';

import './Damage.module.css';
import type { PMF } from '@utils/math';
import type {
  AC, AdvantageType, DamagerKey, PlayerKey,
} from '@damage/types';
import { Damager, Player } from '@damage/types';
import DamageFooter from '@damage/DamageFooter';
import {
  DamageDataContext,
  DamageDetailsContext,
  DispatchPlayerListContext,
  InitialPlayerListContext,
  PlayerContext,
  SelectedPlayerContext,
  SetModalContext,
} from '@damage/contexts';
import DamageHeader from '@damage/DamageHeader';

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
  damagerType: 'dt',
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
  PlayerKey,
  Map<DamagerKey, Map<AdvantageType, Map<AC, number>>>
>;
export type DamageDetails = Map<
  PlayerKey,
  Map<DamagerKey, Map<AdvantageType, Map<AC, PMF>>>
>;

const MemoDamageGraphs = React.memo(DamageGraphsAside);

const MemoPlayerCard = React.memo(PlayerCard);

export type PlayerList = { [key: number]: Player };

// region [[Player Reducer Types]]
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
// endregion

const transformPlayerList = (p: PlayerList, inflate: boolean) => {
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

const Damage = () => {
  const router = useRouter();
  const [hideGraphs, setHideGraphs] = useState(false);
  const { height, width } = useViewportSize();

  const playerListReducer = (
    state: { [key: number]: Player },
    action: playerListReducerAction,
  ): PlayerList => {
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
              ([k, v]) => Number(k) !== action.damagerKey,
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
  }, [width, hideGraphs]);

  const debouncedUpdateURI = useDebouncedCallback(() => {
    setUri(
      `${window.location.href.replace(window.location.search, '')}?d=${Buffer.from(
        JSON.stringify(transformPlayerList(playerList, false), replacer),
      ).toString('base64')}`,
    );
  }, 1000);

  useEffect(() => {
    debouncedUpdateURI();
  }, [playerList]);

  const setData = React.useCallback((data: string) => {
    if (data) {
      // console.log(data);
      const d = Buffer.from(data, 'base64').toString();
      const newPlayerList = transformPlayerList(
        JSON.parse(d, reviver) as PlayerList,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const colorFill = color.children[0].getAttribute('fill') || '#AAAAAA';
      legendYOffset += 15;
      // const ydex = legendYOffset += 15;
      return `<rect x="5" y="${legendYOffset}" fill="${colorFill}" width="10" height="10"></rect> <text  x="${legendXOffset}" y="${
        legendYOffset + 4
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
      }).catch((e) => console.error(e));
      // setUri(`${location.href.replace(location.search, "")}?s=${shortHash}`);
      navigator.clipboard.writeText(
        `${window.location.href.replace(window.location.search, '')}?s=${shortHash}`,
      ).catch((e) => console.error(e));
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
                <DispatchPlayerListContext.Provider value={dispatchPlayerList}>
                  <SelectedPlayerContext.Provider value={selectedPlayerKey}>
                    <Modal opened={modalOpen} onClose={() => setModalOpen(false)}>
                      {modalContent}
                    </Modal>
                    <AppShell
                      padding={0}
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
                        <DamageHeader
                          colorScheme={colorScheme}
                          onClick={() => toggleColorScheme()}
                          hideGraphs={hideGraphs}
                          onClick1={() => setHideGraphs((o) => !o)}
                          width={width}
                        />
                    )}
                      footer={(
                        <DamageFooter
                          opened={showCopyPopup}
                          onClick={() => {
                            submitURL().catch((e) => console.error(e));
                          }}
                          colorScheme={colorScheme}
                        />
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
                        <Button variant="outline" onClick={() => { dispatchPlayerList({ field: 'NEW_PLAYER' }); }}>
                          New Player
                        </Button>
                      </Paper>
                    </AppShell>
                  </SelectedPlayerContext.Provider>
                </DispatchPlayerListContext.Provider>
              </InitialPlayerListContext.Provider>
            </DamageDetailsContext.Provider>
          </DamageDataContext.Provider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
};

export default Damage;
