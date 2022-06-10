import Head from 'next/head';
import { ParentSize } from '@visx/responsive';
import {
  AppShell, Burger, Footer, Header, MediaQuery, Title,
} from '@mantine/core';
import BestiaryFilterNavbar from '@condition/BestiaryFilter.navbar';
import React, { useEffect, useState, useMemo } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { useDebouncedCallback } from 'use-debounce';
import type { StringifiableRecord } from 'query-string';
import queryString from 'query-string';
import CreatureList from '@condition/CreatureList';
import ConditionImmunityGraph from '@condition/ConditionImmunity.graph';
import { CREATURE_TYPES, SOURCES } from '@condition/constants';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import type { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { Zoom } from '@visx/zoom';
import { localPoint } from '@visx/event';
import SpellListAside from '@couatl/SpellListAside';
import type { Translate, ProvidedZoom } from '@visx/zoom/lib/types';
import type { CreatureName, SpellName } from '@couatl/types';

const peach = '#fd9b93';
const pink = '#fe6e9e';
const blue = '#03c0dc';
const green = '#26deb0';
const plum = '#71248e';
const lightpurple = '#374469';
const white = '#ffffff';
export const background = '#272b4d';

interface TreeNode {
  name: string;
  children?: this[];
}

type HierarchyNode = HierarchyPointNode<TreeNode>;

export interface Filters extends StringifiableRecord {
  crInclude: [number, number];
  creatureTypeInclude: Partial<typeof CREATURE_TYPES>;
  sources: Partial<typeof SOURCES>;
}

export interface CouatlDatapack {
  hierarchy: {
    name: string,
    children: CouatlDatapack
  };
  bySpell: Record<CreatureName, SpellName[]>;
}

function getElementCoords(element, coords) {
  const ctm = element.getCTM();
  const x = ctm.e + coords.x * ctm.a + coords.y * ctm.c;
  const y = ctm.f + coords.x * ctm.b + coords.y * ctm.d;
  return { x, y };
}
const Couatl = () => {
  const [zoomRef, setZoomRef_] = useState<ProvidedZoom<SVGSVGElement>>();
  const setZoomRef = useDebouncedCallback(setZoomRef_, 500);
  // let zoomRef: ProvidedZoom<SVGSVGElement>;
  const [filterVisible, setFilterVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    crInclude: [0, 30],
    creatureTypeInclude: CREATURE_TYPES,
    sources: SOURCES,
  });
  const [datapack, setDatapack] = useState<CouatlDatapack>();
  const [selection, setSelection] = useState<[number, number]>();
  const viewPortWidth = useViewportSize().width;
  useEffect(() => () => {
    //
  }, [selection]);

  const debounced = useDebouncedCallback(() => {
    fetch(
      queryString.stringifyUrl(
        {
          url: 'https://arcane.cephalon.xyz/couatl',
        },
        { arrayFormat: 'comma' },
      ),
    )
      .then((res) => res.json())
      .then((d) => {
        setDatapack(d as CouatlDatapack);
      }).catch((e) => console.error(e));
  }, 500);

  useEffect(() => {
    debounced();
  }, [debounced, filters]);

  const RootNode = ({ node }: { node: HierarchyNode }) => (
    <Group top={node.x} left={node.y} id="rootnode">
      <circle r={50} fill="url('#lg')" />
      <text
        dy=".33em"
        fontSize={30}
        fontFamily="Arial"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={white}
      >
        {node.data.name}
      </text>
    </Group>
  );

  const ParentNode = ({ node }: { node: HierarchyNode }) => {
    const width = node.data.name.length * 11;
    const height = 25;
    const centerX = -width / 2;
    const centerY = -height / 2;

    return (
      <Group top={node.x} left={node.y}>
        <rect
          height={height}
          width={width}
          y={centerY}
          x={centerX}
          fill={background}
          stroke={blue}
          strokeWidth={1}
          onClick={() => {
            alert(`clicked: ${JSON.stringify(node.data.name)}`);
          }}
        />
        <text
          dy=".33em"
          fontSize={20}
          fontFamily="Arial"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
          fill={white}
        >
          {node.data.name}
        </text>
      </Group>
    );
  };
  const Node = ({ node, fullname }: { node: HierarchyNode, fullname: string }) => {
    if (!node?.data?.name?.length) {
    }
    const width = node.data.name.length * 8;
    const height = 20;
    const centerX = -width / 2;
    const centerY = -height / 2;
    const isRoot = node.depth === 0;
    const isParent = !!node.children;

    if (isRoot) return <RootNode node={node} />;
    if (isParent) return <ParentNode node={node} />;

    return (
      <Group top={node.x} left={node.y} id={fullname} className={`${node.x}|${node.y}`}>
        <rect
          height={height}
          width={width}
          y={centerY}
          x={centerX}
          fill={background}
          stroke={green}
          strokeWidth={1}
          strokeDasharray="2,2"
          strokeOpacity={0.6}
          rx={5}
          onClick={() => {
            alert(`clicked: ${JSON.stringify(node.data.name)}`);
          }}
        />
        <text
          dy=".33em"
          fontSize={14}
          fontFamily="Arial"
          textAnchor="middle"
          fill={green}
          style={{ pointerEvents: 'none' }}
        >
          {node.data.name}
        </text>
      </Group>
    );
  };

  const margin = {
    top: 10, left: 80, right: 80, bottom: 10,
  };

  type TreeProps = {
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
  };
  // const { height, width } = useViewportSize();

  const data = useMemo(() => datapack?.hierarchy && hierarchy(datapack.hierarchy), [datapack]);
  // const yMax = height - margin.top - margin.bottom;
  // const xMax = width - margin.left - margin.right;
  // const [zoomRef, setZoomRef] = useState<(translate: any) => void>();
  return (
    <div>
      <Head>
        <title>Perception by Creature Type</title>
      </Head>
      <AppShell
        fixed
        padding="sm"
        aside={(
          <SpellListAside
            spells={datapack?.bySpell}
            jumpTo={
              ({ creature, spell }) => {
                console.log({ creature });
                console.log({ spell });
                const el = document.getElementById(`${creature}|${spell}`);
                const root = document.getElementById('rootnode');
                // console.log({ root });
                // console.log(el?.getAttribute('transform').sea);
                console.log({ el });

                const match = el?.getAttribute('transform')?.match(/translate\(([\d.]*),\s*([\d.]*)\)/);
                const [translateX, translateY] = [Number(match?.[2]), Number(match?.[1])];

                const rootMatch = root?.getAttribute('transform')?.match(/translate\(([\d.]*),\s*([\d.]*)\)/);
                const [rootTranslateX, rootTranslateY] = [Number(rootMatch?.[2]), Number(rootMatch?.[1])];

                // console.log(rootTranslateX - translateX)
                // console.log(rootTranslateY - translateY)
                const v = { x: rootTranslateX - translateX, y: rootTranslateY - translateY };

                const rootPoint = zoomRef.applyInverseToPoint({ x: rootTranslateX, y: rootTranslateY });
                const selectedPoint = zoomRef.applyInverseToPoint({ x: translateX, y: translateY });

                const diff = { x: rootPoint.x - selectedPoint.x, y: rootPoint.y - selectedPoint.y };
                console.log(zoomRef.applyToPoint(diff));

                // console.log({ diff });
                // const coordsRoot = getElementCoords(root, { x: 0, y: 0 });
                // console.log({ coordsRoot });
                // const coords = getElementCoords(el, coordsRoot);
                console.log({ zoomRef });
                // console.log(coords);

                // console.log(el.className);
                // console.log({ translateX });
                // console.log({ translateY });
                // console.log(zoomRef);

                // Get post-transform coords from the element.
                // let circle = document.getElementById('svgCircle');
                // const x = +circle.getAttribute('cx');
                // const y = +circle.getAttribute('cy');
                // let coords = getElementCoords(circle, { x, y });
                //
                // // Get post-transform coords using a 'node' object.
                // Any object with x,y properties will do.
                //                 var node = // some D3 node or object with x,y properties.
                // circle = document.getElementById('svgCircle'),
                // coords = getElementCoords(circle, node);
                // console.log(zoomRef.applyInverseToPoint({ x: Number(translateX), y: Number(translateY) }));
                zoomRef && zoomRef.translateTo(zoomRef.applyInverseToPoint(diff));
              }
            }
          />
        )}
        header={(
          <Header height={60} p="xs">
            header :)
            {/* <div */}
            {/*  style={{ display: 'flex', alignItems: 'center', height: '100%' }} */}
            {/* > */}
            {/*  <MediaQuery largerThan="sm" styles={{ display: 'none' }}> */}
            {/*    <Burger */}
            {/*      opened={filterVisible} */}
            {/*      onClick={() => setFilterVisible((o) => !o)} */}
            {/*      size="sm" */}
            {/*      mr="xl" */}
            {/*    /> */}
            {/*  </MediaQuery> */}
            {/*  <Title style={{ fontSize: viewPortWidth > 768 ? '3vh' : '1.5vh' }}> */}
            {/*    Condition Immunity by Creature Type */}
            {/*  </Title> */}
            {/*  <Burger */}
            {/*    opened={listVisible} */}
            {/*    onClick={() => setListVisible((o) => !o)} */}
            {/*    size="sm" */}
            {/*    ml="auto" */}
            {/*    mr="sm" */}
            {/*  /> */}
            {/* </div> */}
          </Header>
        )}
        footer={(
          <Footer height={60} p="md">
            🔮
          </Footer>
        )}
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
            height: '100vh',
          },
        })}
      >
        <ParentSize>
          {({ width, height }) => (

            <Zoom<SVGSVGElement> width={width} height={height}>
              {(zoom) => (datapack
                && (Boolean(setZoomRef(zoom)) || true) && (
                  <svg width={width} height={height} ref={zoom.containerRef}>
                    <LinearGradient id="lg" from={peach} to={pink} />
                    <rect
                      width={width}
                      height={height}
                      rx={14}
                      fill={background}
                      onTouchStart={zoom.dragStart}
                      onTouchMove={zoom.dragMove}
                      onTouchEnd={zoom.dragEnd}
                      onMouseDown={zoom.dragStart}
                      onMouseMove={zoom.dragMove}
                      onMouseUp={zoom.dragEnd}
                      onMouseLeave={() => {
                        if (zoom.isDragging) zoom.dragEnd();
                      }}
                      onDoubleClick={(event) => {
                        const point = localPoint(event) || { x: 0, y: 0 };
                        zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                      }}
                    />
                    <Tree
                      root={data}
                      size={[(height - margin.top - margin.bottom) * 12, (width - margin.left - margin.right) * 2]}
                    >
                      {(tree) => (
                        <Group
                          top={margin.top}
                          left={margin.left}
                          transform={zoom.toString()}
                        >
                          {tree.links().map((link, i) => (
                            <LinkHorizontal
                              key={`link-${i}`}
                              data={link}
                              stroke={lightpurple}
                              strokeWidth="1"
                              fill="none"
                            />
                          ))}
                          {tree.descendants().map((node, i) => (
                            <Node
                              key={`node-${i}`}
                              node={node}
                              fullname={`${node.parent?.data.name}|${node.data.name}`}
                            />
                          ))}
                        </Group>
                      )}
                    </Tree>
                  </svg>
              )
              )}
            </Zoom>
          )}

        </ParentSize>
      </AppShell>
    </div>
  );
};

export default Couatl;
