// MIT License
//
// Copyright (c) 2019-2022 webkid GmbH, Zenith
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import type { HTMLAttributes } from 'react';
import React, { memo, useContext, forwardRef } from 'react';
import cc from 'classcat';
import shallow from 'zustand/shallow';

import {
  useStore, useStoreApi, Position, addEdge, NodeProps,
} from 'react-flow-renderer';

import type {
  HandleProps, Connection, ReactFlowState, Handle as Handle_,
} from 'react-flow-renderer';
import { Paper, Text } from '@mantine/core';
import { NodeIdContext } from '@damageBlocks/contexts';
import type { NodeLabelTypes } from '@damageBlocks/constants';
import { checkElementBelowIsValid, handleMouseDown } from './handler';

export const getHostForElement = (element: HTMLElement): Document | ShadowRoot => (element.getRootNode?.() as Document | ShadowRoot) || window?.document;

const alwaysValid = () => true;

export type HandleComponentProps = HandleProps & Omit<HTMLAttributes<HTMLDivElement>, 'id'> & {labelType: NodeLabelTypes};

const selector = (s: ReactFlowState) => ({
  onConnectAction: s.onConnect,
  onConnectStart: s.onConnectStart,
  onConnectStop: s.onConnectStop,
  onConnectEnd: s.onConnectEnd,
  onClickConnectStart: s.onClickConnectStart,
  onClickConnectStop: s.onClickConnectStop,
  onClickConnectEnd: s.onClickConnectEnd,
  connectionMode: s.connectionMode,
  connectionStartHandle: s.connectionStartHandle,
  connectOnClick: s.connectOnClick,
  hasDefaultEdges: s.hasDefaultEdges,
});

const Handle = forwardRef<HTMLDivElement, HandleComponentProps>(
  (
    {
      type = 'source',
      position = Position.Top,
      isValidConnection = alwaysValid,
      isConnectable = true,
      id,
      onConnect,
      children,
      className,
      onMouseDown,
      labelType,
      ...rest
    },
    ref,
  ) => {
    const store = useStoreApi();
    const nodeId = useContext(NodeIdContext);
    const {
      onConnectAction,
      onConnectStart,
      onConnectStop,
      onConnectEnd,
      onClickConnectStart,
      onClickConnectStop,
      onClickConnectEnd,
      connectionMode,
      connectionStartHandle,
      connectOnClick,
      hasDefaultEdges,
    } = useStore(selector, shallow);

    const handleId = id || null;
    const isTarget = type === 'target';

    const onConnectExtended = (params: Connection) => {
      console.log('Extended!');
      const { defaultEdgeOptions } = store.getState();

      const edgeParams = {
        ...defaultEdgeOptions,
        ...params,
      };
      if (hasDefaultEdges) {
        const { edges } = store.getState();
        store.setState({ edges: addEdge(edgeParams, edges) });
      }

      onConnectAction?.(edgeParams);
      onConnect?.(edgeParams);
    };

    const onMouseDownHandler = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        handleMouseDown(
          event,
          handleId,
          nodeId,
          store.setState,
          onConnectExtended,
          isTarget,
          isValidConnection,
          connectionMode,
          undefined,
          undefined,
          onConnectStart,
          onConnectStop,
          onConnectEnd,
        );
      }
      onMouseDown?.(event);
    };

    const onClick = (event: React.MouseEvent) => {
      console.log('click started :)');
      if (!connectionStartHandle) {
        onClickConnectStart?.(event, { nodeId, handleId, handleType: type });
        console.log('setting start handle');
        console.log({ nodeId });
        store.setState({ connectionStartHandle: { nodeId, type, handleId } });
        return;
      }

      const doc = getHostForElement(event.target as HTMLElement);
      const { connection, isValid } = checkElementBelowIsValid(
        event as unknown as MouseEvent,
        connectionMode,
        connectionStartHandle.type === 'target',
        connectionStartHandle.nodeId,
        connectionStartHandle.handleId || null,
        isValidConnection,
        doc,
      );

      onClickConnectStop?.(event as unknown as MouseEvent);
      console.log({ isValid });
      if (isValid) {
        onConnectExtended(connection);
      }

      onClickConnectEnd?.(event as unknown as MouseEvent);

      store.setState({ connectionStartHandle: null });
    };

    const handleClasses = cc([
      'react-flow__handle',
      `react-flow__handle-${position}`,
      'nodrag',
      className,
      {
        source: !isTarget,
        target: isTarget,
        connectable: isConnectable,
        connecting:
          connectionStartHandle?.nodeId === nodeId
          && connectionStartHandle?.handleId === handleId
          && connectionStartHandle?.type === type,
      },
    ]);

    return (
      <Paper
        data-handleid={handleId}
        data-nodeid={nodeId}
        data-handlepos={position}
        className={handleClasses}
        onMouseDown={onMouseDownHandler}
        onClick={connectOnClick ? onClick : undefined}
        ref={ref}
        withBorder
        {...rest}
        // style={{
        //   display: 'flex',
        //   justifyContent: 'center',
        //   alignItems: 'center',
        //   fontSize: '0.7em',
        //   color: 'white',
        //   height: '1.2em',
        //   width: 'fit-content',
        //   borderRadius: '0',
        //   ...NodeLabels[labelType],
        // }}
      >
        Player
        {children}
      </Paper>
    );
  },
);

Handle.displayName = 'Handle';

export default memo(Handle);
