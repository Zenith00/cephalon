/* eslint-disable jsx-a11y/control-has-associated-label */
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Collapse,
  Divider,
  Group,
  Header,
  MantineProvider,
  Navbar,
  ScrollArea,
  Table,
  Title,
  useMantineTheme,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useListState, useToggle, useViewportSize } from '@mantine/hooks';
import WheelNumberInput from '@/common/WheelNumberInput';
import { useSearchParams  } from "react-router-dom";

import {
   IconChevronDown,  IconChevronUp, IconMoonStars, IconSun,
} from '@tabler/icons-react';
// import DamageFooter from '@/damage/DamageFooter';
import { gzip } from 'pako';
import { useDebouncedCallback } from 'use-debounce';
import Logo from '@/common/Logo.component';
import { useImmer } from 'use-immer';

const ABILITY_SCORES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

interface AbilityScore {
  value: number
  bonus: number
}

interface Rules {
  minScore: number,
  maxScore: number,
  points: number
}

const DEFAULT_ABILITY_SCORE_COSTS = [0, -16, -12, -9, -6, -4, -2, -1, 0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 19, 24, 29];
const DEFAULT_RULES = { minScore: 8, maxScore: 15, points: 27 };
type AbilityScoreData = Record<typeof ABILITY_SCORES[number], AbilityScore>

const PointBuy = () => {
  const [points, setPoints] = useImmer<AbilityScoreData>(
    {
      Strength: { value: 8, bonus: 0 },
      Dexterity: { value: 8, bonus: 0 },
      Constitution: { value: 8, bonus: 0 },
      Intelligence: { value: 8, bonus: 0 },
      Wisdom: { value: 8, bonus: 0 },
      Charisma: { value: 8, bonus: 0 },
    },
  );
  const { height, width } = useViewportSize();
  // const router = useRouter();
	const [currentQueryParameters, setSearchParams] = useSearchParams();

  const [pointCosts, setPointCostHandlers] = useListState(DEFAULT_ABILITY_SCORE_COSTS);
  const [rules, setRules] = useImmer<Rules>(DEFAULT_RULES);
  const canSet = (total:number|undefined) => total && (total >= 1) && (total <= 20);
  const pointTotal = Object.values(points).reduce((acc, n) => acc + pointCosts[n.value], 0);
  const [hideNavbar, setHideNavbar] = useState(true);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showCustomScores, toggleShowCustomScores] = useToggle( [false, true]);
  const [themeColor, toggleThemeColor] = useToggle<'dark'|'light'>(['dark', 'light']);
  function incrementScore(data: AbilityScore, abilityScore: typeof ABILITY_SCORES[number], type: 'bonus'|'value') {
    const other = type === 'bonus' ? 'value' : 'bonus';
    return (newValue: number) => {
      if (canSet(data[other] + newValue)) {
        setPoints(((draft) => {
          (draft[abilityScore][type] = newValue);
        }));
      }
    };
  }
  const [uri, setUri] = useState('');

  // const deflate = () => {
  //   const ruleString = [rules.minScore, rules.maxScore, rules.points].join(',');
  //   const pointString = ABILITY_SCORES.map((abilityScore) => `${points[abilityScore].value},${points[abilityScore].bonus}`).join('.');
  //   const pointCostString = JSON.stringify(pointCosts.join(','));
  //   return `${ruleString}|${pointString}|${pointCostString}`;
  // };
  // const inflate = (deflated: string) => {
  //   const [ruleString, pointString, pointCostString] = deflated.split('|');
  //   const [minScore, maxScore, points_] = ruleString.split(',');
  //   setRules({ minScore: Number(minScore), maxScore: Number(maxScore), points: Number(points_) });
  //
  //   const newPoints = Object.fromEntries(pointString.split('.').map((valbonus, index) => {
  //     const [value, bonus] = valbonus.split(',');
  //     return [ABILITY_SCORES[index], { value: Number(value), bonus: Number(bonus) }];
  //   }));
  //   setPoints(newPoints);
  //
  //   setPointCostHandlers.setState(JSON.parse(pointCostString));
  // };

  const debouncedUpdateURI = useDebouncedCallback(() => {
    setUri(Buffer.from(
      JSON.stringify([rules, points, pointCosts]),
    ).toString('base64'));
  }, 1000);

  useEffect(() => {
    debouncedUpdateURI();
  }, [rules, points, pointCosts]);

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
            const d = Buffer.from(t, 'base64').toString();
            const [rules_, points_, pointCosts_] = JSON.parse(d) as [typeof rules, typeof points, typeof pointCosts];
            console.log({ rules_ });
            console.log({ points_ });
            console.log({ pointCosts_ });
            setRules(rules_);
            setPoints(points_);
            setPointCostHandlers.setState(pointCosts_);
          }).catch(() => { /* ignore */ });
        })
        .catch(() => {
          window.location.assign('/Damage');
        });
    }
  }, []);

  const submitURL = () => {
    console.log({ uri });
    fetch('https://s.cephalon.xyz', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
      body: gzip(
        JSON.stringify({
          image: JSON.stringify(points),
          type: 'PointBuy',
          datahash: uri,
        }),
      ),
    }).then((r) => r.text().then((shortHash) => {
      setSearchParams({
          s: shortHash,
      })
      // setUri(`${location.href.replace(location.search, "")}?s=${shortHash}`);
      navigator.clipboard.writeText(
        `${window.location.href.replace(window.location.search, '')}?s=${shortHash}`,
      ).catch((e) => console.error(e));
      setShowCopyPopup(true);
      setTimeout(() => setShowCopyPopup(false), 850);
    })).catch((e) => console.error(e));
  };
  const theme = useMantineTheme();

  return (
    <MantineProvider theme={{ colorScheme: themeColor }} withGlobalStyles>
      <head>
        <meta property="REWRITE_ANCHOR" />
        <meta property="REWRITE_ANCHOR_URL" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="og:title" content="Point Buy" />
        <title>Point Buy Calculator</title>
      </head>
      <AppShell
        fixed
        padding="sm"
        navbar={(
          <Navbar width={{ sm: 200, md: 300 }} p="xs" hiddenBreakpoint="sm" hidden={hideNavbar}>
            <Navbar.Section>
              <WheelNumberInput
                label="Available Points"
                min={1}
                value={rules.points}
                onChange={(newValue) => setRules(((draft) => { draft.points = newValue || 1; }))}
                onWheel={(ev: React.WheelEvent) => {
                  const newValue = rules.points + (ev.deltaY < 0 ? 1 : -1);
                  setRules(((draft) => { draft.points = newValue; }));
                }}
              />
              <WheelNumberInput
                label="Maximum Score"
                value={rules.maxScore}
                max={20}
                min={1}
                onChange={(newValue) => setRules(((draft) => { draft.maxScore = newValue || 20; }))}
                onWheel={(ev: React.WheelEvent) => {
                  const newValue = rules.maxScore + (ev.deltaY < 0 ? 1 : -1);
                  if (newValue <= 20 && newValue >= 1) setRules(((draft) => { draft.maxScore = newValue; }));
                }}
              />
              <WheelNumberInput
                label="Minimum Score"
                value={rules.minScore}
                max={20}
                min={1}
                onChange={(newValue) => setRules(((draft) => { draft.minScore = newValue || 1; }))}
                onWheel={(ev: React.WheelEvent) => {
                  const newValue = rules.minScore + (ev.deltaY < 0 ? 1 : -1);
                  if (newValue <= 20 && newValue >= 1) setRules(((draft) => { draft.minScore = newValue; }));
                }}
              />
            </Navbar.Section>
            <div>
              <Button
                mt="sm"
                variant="light"
                onClick={() => setRules(DEFAULT_RULES)}
              >
                Reset
              </Button>
            </div>
            <Divider my="sm" />
            <Navbar.Section grow component={ScrollArea}>
              <Title order={4}>
                <Button onClick={() => toggleShowCustomScores()} variant="subtle" mb="md" compact>
                  <Group align="stretch">
                    <div style={{ alignItems: 'center', display: 'flex', height: '100%' }}>
                      {showCustomScores ? <IconChevronUp /> : <IconChevronDown />}
                      Point Costs
                    </div>

                  </Group>
                </Button>

              </Title>
              <Collapse in={showCustomScores}>
                <table>
                  <thead>
                    <tr>
                      <th>Score</th>
                      <th>cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointCosts.slice(1).reverse().map((cost, index) => {
                      const realIndex = pointCosts.length - index - 1;
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <tr key={(index.toString())}>
                          <td>{realIndex}</td>
                          <td>
                            <WheelNumberInput
                              value={pointCosts[realIndex]}
                              onChange={(val: number) => setPointCostHandlers.setItem(realIndex, val)}
                              onWheel={(ev: React.WheelEvent) => {
                                const newBonus = pointCosts[realIndex] + (ev.deltaY < 0 ? 1 : -1);
                                setPointCostHandlers.setItem(realIndex, newBonus);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td />
                      <td>
                        <Button
                          variant="light"
                          onClick={() => setPointCostHandlers.setState(DEFAULT_ABILITY_SCORE_COSTS)}
                        >
                          Reset
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Collapse>
            </Navbar.Section>
          </Navbar>
        )}
        header={(
          <Header height={60} p="xs">

            <div
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              <Burger
                opened={!hideNavbar}
                onClick={() => setHideNavbar(!hideNavbar)}
                size="sm"
                style={width > Number(theme.breakpoints.sm) ? { display: 'none' } : {}}
              />
              <Logo colorScheme={themeColor} />

              <Title order={2}>Point Buy Calculator</Title>
              <ActionIcon
                variant="outline"
                color={themeColor === 'light' ? 'yellow' : 'blue'}
                onClick={() => toggleThemeColor()}
                title="Toggle color scheme"
                ml="auto"
                mr="lg"
                mx="auto"
              >
                {themeColor === 'light' ? (
                  <IconSun size={18} />
                ) : (
                  <IconMoonStars size={18} />
                )}
              </ActionIcon>
            </div>

          </Header>
)}
        // footer={<DamageFooter opened={showCopyPopup} onClick={() => submitURL()} colorScheme={themeColor} />}
      >
        <Table id="pointTable">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Score</th>
              <th />
              <th>Bonus</th>
              <th />
              <th>Total</th>
              <th>Ability Modifier</th>
              <th>Point Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(points).map(([abilityScore, data]) => (
              <tr key={abilityScore}>
                <td>{abilityScore}</td>
                <td>
                  <WheelNumberInput
                    value={data.value}
                    onChange={incrementScore(data, abilityScore, 'value')}
                    max={Math.min(rules.maxScore, 20 - data.bonus)}
                    min={rules.minScore}
                    onWheel={(ev: React.WheelEvent) => {
                      const newValue = data.value + (ev.deltaY < 0 ? 1 : -1);
                      if ((newValue >= rules.minScore) && (newValue <= rules.maxScore)) {
                        incrementScore(data, abilityScore, 'value')(newValue);
                      }
                    }}
                  />
                </td>
                <td>
                  +
                </td>
                <td>
                  <WheelNumberInput
                    value={data.bonus}
                    onChange={incrementScore(data, abilityScore, 'bonus')}
                    max={20 - data.value}
                    onWheel={(ev: React.WheelEvent) => {
                      const newBonus = data.bonus + (ev.deltaY < 0 ? 1 : -1);
                      incrementScore(data, abilityScore, 'bonus')(newBonus);
                    }}
                  />
                </td>
                <td>
                  =
                </td>
                <td>
                  {data.value + data.bonus}
                </td>
                <td>{Math.floor((data.value + data.bonus - 10) / 2)}</td>
                <td>{pointCosts[data.value]}</td>
              </tr>
            ))}
            <tr>
              <td />
              <td>
                <Button
                  variant="light"
                  onClick={() => setPoints(
                    (draft) => { ABILITY_SCORES.forEach((abilityScore) => { draft[abilityScore].value = 8; }); },
                  )}
                >
                  Reset
                </Button>
              </td>
              <td />
              <td>
                <Button
                  variant="light"
                  onClick={() => setPoints(
                    (draft) => { ABILITY_SCORES.forEach((abilityScore) => { draft[abilityScore].bonus = 0; }); },
                  )}
                >
                  Reset
                </Button>
              </td>
              <td />
              <td />
              <td />
              <td style={{ color: pointTotal > rules.points ? 'red' : 'green' }}>
                {pointTotal}
                /
                {rules.points}
              </td>
            </tr>
          </tbody>

        </Table>
      </AppShell>
    </MantineProvider>
  );
};

export default PointBuy;
