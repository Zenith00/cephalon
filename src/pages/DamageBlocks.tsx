// import React, { useEffect, useMemo, useState } from "react";
// import ReactFlow, {
//   addEdge,
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   MarkerType,
// } from "react-flow-renderer";
// import type {
//   Edge,
//   Connection,
//   Node,
//   ReactFlowInstance,
//   OnInit,
//   NodeProps,
//   NodeChange,
//   EdgeChange,
// } from "react-flow-renderer";
// import type { PlayerNodeData } from "@damageBlocks/nodes/PlayerNode.component";
// import PlayerNode from "@damageBlocks/nodes/PlayerNode.component";
// import type { ColorScheme } from "@mantine/core";
// import { Divider, Title, Header, Navbar, MantineProvider } from "@mantine/core";
// import { useId, useToggle } from "@mantine/hooks";
// import type { TargetNodeData } from "@damageBlocks/nodes/TargetNode.component";
// import TargetNode from "@damageBlocks/nodes/TargetNode.component";
// import DamageBlockSidebar from "@damageBlocks/DamageBlockSidebar";
// import DamagerNode from "@damageBlocks/nodes/DamagerNode.component";
// import type { NodeLabelTypes, NodeTypeDatum } from "@damageBlocks/constants";
// import { Player, Damager } from "@damage/types";
// import type { NodeKeyType, NodeMetadatum } from "@damageBlocks/types";
// import { SetNodesContext, UpdateNodeContext } from "@damageBlocks/contexts";
// import { BlockDamager, BlockPlayer } from "@damageBlocks/types";
// import produce from "immer";
// import { make_pmf } from "@utils/math";

// type NodeData = PlayerNodeData | TargetNodeData;

// const initialNodes = [
//   {
//     id: "player|1",
//     type: "player",
//     data: { player: new BlockPlayer("player|1") },
//     position: { x: 250, y: 0 },
//   },
//   {
//     id: "target|1",
//     type: "target",
//     data: {},
//     position: { x: 350, y: 100 },
//   },
//   {
//     id: "damager|1",
//     type: "damager",
//     data: {
//       damager: new BlockDamager("damager|1"),
//       hitPMF: make_pmf(0),
//     },
//     position: { x: 450, y: 200 },
//   },
// ] as Node<NodeMetadatum>[];
// // (Omit<Node<NodeData>, 'id'> & {id: NodeIDType})

// interface EdgeData {}

// const initialEdges = [
//   // {
//   //   id: 'e1-2', source: '1', target: '2', label: 'this is an edge label',
//   // },
// ] as Edge<EdgeData>[];

// const onInit = (reactFlowInstance: ReactFlowInstance) =>
//   console.log("flow loaded:", reactFlowInstance);

// const idCounts: Record<NodeLabelTypes, number> = {
//   player: 1,
//   target: 1,
//   damager: 1,
//   onHit: 1,
// };
// // let playerId = 1;
// // let targetId = 1;
// // let damagerId = 1;

// // const getId = () => `damagenode_${id++}`;

// const DamageBlocks = () => {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

//   useEffect(() => {
//     console.log(edges);
//   }, [edges]);
//   // useEffect(() => {
//   //   console.log(nodes);
//   // }, [nodes]);

//   // const onNodesChange = React.useCallback((nodeChanges: NodeChange[]) => {
//   //   console.log('on nodes change');
//   //   console.log({ nodeChanges });
//   //   onNodesChange_(nodeChanges);
//   // }, [onNodesChange_]);
//   //
//   // const onEdgesChange = React.useCallback((edgeChanges: EdgeChange[]) => {
//   //   console.log('on edge change');
//   //   console.log({ edgeChanges });
//   //   onEdgesChange_(edgeChanges);
//   // }, [onNodesChange_]);

//   const onConnect = (params: Edge | Connection) => {
//     console.log("on connect");
//     console.log(params);
//     setEdges((eds) => addEdge(params, eds));
//   };

//   const nodeTypes = useMemo(
//     () => ({ player: PlayerNode, target: TargetNode, damager: DamagerNode }),
//     []
//   );

//   const [colorScheme, toggleColorScheme] = useToggle<ColorScheme>("dark", [
//     "dark",
//     "light",
//   ]);
//   const [reactFlowInstance, setReactFlowInstance] =
//     useState<ReactFlowInstance | null>(null);
//   const reactFlowWrapper = React.useRef<HTMLDivElement>(null);

//   const isDark = colorScheme === "dark";
//   const rfStyle = {
//     backgroundColor: isDark ? "#1A1B1E" : "#FFFFFF",
//   };
//   const onDragOver = React.useCallback((event: React.DragEvent) => {
//     event.preventDefault();

//     if (!event.dataTransfer) {
//       return;
//     }
//     // eslint-disable-next-line no-param-reassign
//     event.dataTransfer.dropEffect = "move";
//   }, []);

//   // const [metadata, dispatchMetadataUpdate] = React.useReducer(produce((draft: Metadata, [nodeId, metadatumK, metadatumV]: [NodeIDType, keyof MetadatumType, MetadatumType[keyof MetadatumType]]) => {
//   //   const nodeType = nodeId.split('|')[0] as NodeLabelTypes;
//   //   draft[nodeType][nodeId][metadatumK] = metadatumV;
//   // }), initialMetadata);

//   const updateNode = (nodeId: NodeKeyType, nodeDatum: NodeMetadatum) => {
//     const nodeUpdateIndex = nodes.findIndex((node) => node.id === nodeId);
//     setNodes(
//       produce((draft) => {
//         draft[nodeUpdateIndex] = { ...draft[nodeUpdateIndex], data: nodeDatum };
//       })
//     );
//   };

//   const onDrop = React.useCallback(
//     (event: React.DragEvent) => {
//       event.preventDefault();
//       if (
//         !reactFlowWrapper.current ||
//         !reactFlowInstance ||
//         !event.dataTransfer
//       ) {
//         return;
//       }
//       const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
//       const type = event.dataTransfer.getData(
//         "application/reactflow"
//       ) as NodeLabelTypes;

//       // check if the dropped element is valid
//       if (typeof type === "undefined" || !type) {
//         return;
//       }

//       const position = reactFlowInstance.project({
//         x: event.clientX - reactFlowBounds.left,
//         y: event.clientY - reactFlowBounds.top,
//       });
//       const newNode = {
//         id: `${type}|${++idCounts[type]}`,
//         type,
//         position,
//         data: {},
//       } as Node<NodeMetadatum>;

//       setNodes((nds) => nds.concat(newNode));
//     },
//     [reactFlowInstance]
//   );

//   return (
//     <></>
//     // <MantineProvider theme={{ colorScheme }} withGlobalStyles>
//     //   <SetNodesContext.Provider value={setNodes}>
//     //     <UpdateNodeContext.Provider value={updateNode}>
//     //       <div style={{ display: "flex" }}>
//     //         <DamageBlockSidebar />
//     //         <div
//     //           style={{ height: "100vh", width: "80vw" }}
//     //           ref={reactFlowWrapper}
//     //         >
//     //           <ReactFlow
//     //             nodes={nodes}
//     //             edges={edges}
//     //             onNodesChange={onNodesChange}
//     //             onEdgesChange={onEdgesChange}
//     //             onConnect={onConnect}
//     //             onInit={
//     //               setReactFlowInstance as unknown as OnInit<NodeData, EdgeData>
//     //             }
//     //             nodeTypes={nodeTypes}
//     //             fitView
//     //             attributionPosition="top-right"
//     //             style={rfStyle}
//     //             onDrop={onDrop}
//     //             onDragOver={onDragOver}
//     //             connectionLineStyle={{ strokeWidth: 2 }}
//     //           >
//     //             <MiniMap
//     //               nodeStrokeColor={(n) => {
//     //                 if (n.style?.background)
//     //                   return n.style.background.toString();
//     //                 if (n.type === "input") return "#0041d0";
//     //                 if (n.type === "output") return "#ff0072";
//     //                 if (n.type === "default") return "#1a192b";
//     //
//     //                 return "#eee";
//     //               }}
//     //               nodeColor={(n) => {
//     //                 if (n.style?.background)
//     //                   return n.style.background.toString();
//     //
//     //                 return "#fff";
//     //               }}
//     //               nodeBorderRadius={2}
//     //             />
//     //             <Controls />
//     //             <Background color="#aaa" gap={16} />
//     //           </ReactFlow>
//     //         </div>
//     //       </div>
//     //     </UpdateNodeContext.Provider>
//     //   </SetNodesContext.Provider>
//     // </MantineProvider>
//   );
// };

// export default DamageBlocks;
const a = 1;
export default a;