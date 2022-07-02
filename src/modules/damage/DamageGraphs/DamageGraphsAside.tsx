import React, { useContext, useEffect, useState } from 'react';
import {
  Aside, Button, Popover, Switch,
} from '@mantine/core';
import type { Target } from '@pages/Damage';
import { DiceRoller } from 'dice-roller-parser';
// import { useTooltipInPortal, Portal } from "@visx/tooltip";
import DamageGraphCharts from '@damage/DamageGraphs/DamageGraphCharts';
import type { Player, PlayerKey, AdvantageType } from '@damage/types';
import { AdvantageTypes } from '@damage/types';
import { useToggle } from '@mantine/hooks';
import { Plus } from 'tabler-icons-react';
import { AdvancedModeContext } from '@damage/contexts';
import DamageDetails from '@damage/DamageGraphs/DamageDetails';
import type { SetState } from '@utils/typehelpers';

const data1 = [
  { x: '2020-01-01', y: 50 },
  { x: '2020-01-02', y: 10 },
  { x: '2020-01-03', y: 20 },
];

const data2 = [
  { x: '2020-01-01', y: 30 },
  { x: '2020-01-02', y: 40 },
  { x: '2020-01-03', y: 80 },
];

const H = (mod: number, ac: number): number => 1 - Math.min(0.95, Math.max(0, (ac - mod) / 20));

const diceRoller = new DiceRoller();

interface diceNode {
  head: object;
  ops: object[];
  root: boolean;
  type: string;
  mods: object[];
  count: number;
  die: {
    type: 'number';
    value: number;
  };
}

// const target_ac = 16;
// const bonus_to_hit = 0;

const DamageGraphsAside = ({
  target,
  players,
  hidden,
}: {
  target: Target;
  players: { [key: PlayerKey]: Player };
  hidden: boolean;
}) => {
  const [graphWidth, setGraphWidth] = useState('50%');
  const [graphTotals, setGraphTotals] = useState(false);
  const [showSuperAdvantage, setShowSuperAdvantage] = useState(false);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showDisadvantage, setShowDisadvantage] = useState(false);
  const [showSuperDisadvantage, setShowSuperDisadvantage] = useState(false);
  const showAdvantageTypes: Record<AdvantageType, boolean> = {
    advantage: showAdvantage,
    superadvantage: showSuperAdvantage,
    normal: showNeutral,
    disadvantage: showDisadvantage,
    superdisadvantage: showSuperDisadvantage,
  };
  const setShowAdvantageTypes: Record<AdvantageType, SetState<boolean>> = {
    advantage: setShowAdvantage,
    superadvantage: setShowSuperAdvantage,
    normal: setShowNeutral,
    disadvantage: setShowDisadvantage,
    superdisadvantage: setShowSuperDisadvantage,
  };
  const [settingsPopover, setSettingsPopover] = useState(false);
  // const [setModalProp, setSetModalProp] = useState();

  // const SubmitModal = React.useCallback(() => {
  //   setModalContext(DamageCharts);
  // }, []);

  // const toggleWidth = React.useCallback(() => {
  //   setWidth((w) => (w === "50%" ? "100%" : "50%"));
  // }, []);
  const advancedMode = useContext(AdvancedModeContext);

  useEffect(() => {
    // console.log(graphWidth);
  }, [graphWidth]);

  return (
    <Aside
      // width={{ md: "100vw", lg: graphWidth }}
      // width={ graphWidth }
      zIndex={101}
      // style={{ zIndex: 10, maxWidth: 1000 }}
      style={{ zIndex: 10, width: graphWidth }}
      // pr={"md"}
      // hidden={hidden}
      // hiddenBreakpoint="md"
      // height={"100%"}
    >
      <Aside.Section>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {!advancedMode && <Switch label="Graph Per-Player Totals" checked={graphTotals} onChange={(ev) => setGraphTotals(ev.currentTarget.checked)} />}
          {graphTotals && (
          <Popover
            opened={settingsPopover}
            onClose={() => setSettingsPopover(false)}
            position="right"
            withArrow
            target={(
              <Button
                color="blue"
                onClick={() => setSettingsPopover(true)}
                ml={2}
                my={0}
                py={0}
                mr="sm"
                variant="outline"
                compact
              >
                <Plus />
              </Button>
            )}
          >
            {AdvantageTypes.map((advType) => (
              <Switch
                key={advType}
                label={`Show ${advType}`}
                checked={showAdvantageTypes[advType]}
                onChange={(ev) => {
                  setShowAdvantageTypes[advType](ev.currentTarget.checked);
                }}
              />
            ))}
          </Popover>
          )}

        </div>
      </Aside.Section>
      <Aside.Section style={{ paddingTop: 10, paddingLeft: 10, height: '40%' }}>
        <div>
          <DamageGraphCharts
            target={target}
            players={players}
            hidden={hidden}
            graphWidth={graphWidth}
            setGraphWidth={setGraphWidth}
            graphTotals={graphTotals || advancedMode}
            showGraphTotalAdvantage={showAdvantageTypes}
          />
          {/* <XYChart> */}
          {/*  /!*<AnimatedLineSeries dataKey={"0"} data={*!/ */}
          {/*  /!*  damageContext?.get(selectedPlayerContext)?.get(player.damagers[0].key)?.get("normal")?.get(target.ac)*!/ */}
          {/*  /!*} {...accessors} />*!/ */}
          {/* </XYChart> */}
        </div>
      </Aside.Section>
      <Aside.Section style={{ height: '55%', paddingBottom: 0 }}>
        <DamageDetails />
      </Aside.Section>
    </Aside>
  );
};

export default DamageGraphsAside;
