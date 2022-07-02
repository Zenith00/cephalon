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
import type { HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react';
import React, { memo, useContext, forwardRef } from 'react';
import cc from 'classcat';
import shallow from 'zustand/shallow';

import {
  useStore, useStoreApi, Position, addEdge, NodeProps,

  ConnectionMode,
} from 'react-flow-renderer';

import type {
  HandleProps, Connection, ReactFlowState, Handle as Handle_,

  OnConnect,
  OnConnectStart,
  OnConnectStop,
  OnConnectEnd,
  HandleType,
} from 'react-flow-renderer';
import { Paper, Text } from '@mantine/core';
import { NodeIdContext } from '@damageBlocks/contexts';
import type { NodeLabelTypes } from '@damageBlocks/constants';
import { NodeTypeData, NodeTypeStyle } from '@damageBlocks/constants';
import { ArrowRightTail, Circle } from 'tabler-icons-react';
import type { SetState } from 'zustand';

export const getHostForElement = (element: HTMLElement): Document | ShadowRoot => (element.getRootNode?.() as Document | ShadowRoot) || window?.document;
type ValidConnectionFunc = (connection: Connection) => boolean;

type Result = {
  elementBelow: Element | null;
  isValid: boolean;
  connection: Connection;
  isHoveringHandle: boolean;
};

// checks if element below mouse is a handle and returns connection in form of an object { source: 123, target: 312 }
export function checkElementBelowIsValid(
  event: MouseEvent,
  connectionMode: ConnectionMode,
  isTarget: boolean,
  nodeId: string,
  handleId: string | null,
  isValidConnection: ValidConnectionFunc,
  doc: Document | ShadowRoot,
) {
  const elementBelow = doc.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget = elementBelow?.classList.contains('target') || false;
  const elementBelowIsSource = elementBelow?.classList.contains('source') || false;

  const result: Result = {
    elementBelow,
    isValid: false,
    connection: {
      source: null, target: null, sourceHandle: null, targetHandle: null,
    },
    isHoveringHandle: false,
  };

  if (elementBelow && (elementBelowIsTarget || elementBelowIsSource)) {
    result.isHoveringHandle = true;

    // in strict mode we don't allow target to target or source to source connections
    const isValid = connectionMode === ConnectionMode.Strict
      ? (isTarget && elementBelowIsSource) || (!isTarget && elementBelowIsTarget)
      : true;

    if (isValid) {
      const elementBelowNodeId = elementBelow.getAttribute('data-nodeid');
      const elementBelowHandleId = elementBelow.getAttribute('data-handleid');
      const connection: Connection = isTarget
        ? {
          source: elementBelowNodeId,
          sourceHandle: elementBelowHandleId,
          target: nodeId,
          targetHandle: handleId,
        }
        : {
          source: nodeId,
          sourceHandle: handleId,
          target: elementBelowNodeId,
          targetHandle: elementBelowHandleId,
        };

      result.connection = connection;
      result.isValid = isValidConnection(connection);
    }
  }

  return result;
}

function resetRecentHandle(hoveredHandle: Element): void {
  hoveredHandle?.classList.remove('react-flow__handle-valid');
  hoveredHandle?.classList.remove('react-flow__handle-connecting');
}

export function handleMouseDown(
  event: ReactMouseEvent,
  handleId: string | null,
  nodeId: string,
  setState: SetState<ReactFlowState>,
  onConnect: OnConnect,
  isTarget: boolean,
  isValidConnection: ValidConnectionFunc,
  connectionMode: ConnectionMode,
  elementEdgeUpdaterType?: HandleType,
  onEdgeUpdateEnd?: (evt: MouseEvent) => void,
  onConnectStart?: OnConnectStart,
  onConnectStop?: OnConnectStop,
  onConnectEnd?: OnConnectEnd,
): void {
  console.log('handling flow...');
  const reactFlowNode = (event.target as Element).closest('.react-flow');
  console.log(reactFlowNode);
  // when react-flow is used inside a shadow root we can't use document
  const doc = getHostForElement(event.target as HTMLElement);
  console.log(doc);

  if (!doc) {
    return;
  }

  const elBelow = doc.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget = elBelow?.classList.contains('target');
  const elementBelowIsSource = elBelow?.classList.contains('source');

  if (!reactFlowNode || (!elementBelowIsTarget && !elementBelowIsSource && !elementEdgeUpdaterType)) {
    return;
  }

  console.log('flow ok');

  const handleType = elementEdgeUpdaterType || (elementBelowIsTarget ? 'target' : 'source');
  const containerBounds = reactFlowNode.getBoundingClientRect();
  console.log({ containerBounds });
  let recentHoveredHandle: Element;
  console.log({ nodeId });
  console.log({
    x: event.clientX - containerBounds.left - containerBounds.width / 2,
    y: event.clientY - containerBounds.top,
  });
  setState({
    connectionPosition: {
      x: event.clientX - containerBounds.left,
      y: event.clientY - containerBounds.top,
    },
    connectionNodeId: nodeId,
    connectionHandleId: handleId,
    connectionHandleType: handleType,
  });

  onConnectStart?.(event, { nodeId, handleId, handleType });
  console.log('connect started');
  function onMouseMove(ev: MouseEvent) : void {
    setState({
      connectionPosition: {
        x: ev.clientX - containerBounds.left,
        y: ev.clientY - containerBounds.top,
      },
    });

    const {
      connection, elementBelow, isValid, isHoveringHandle,
    } = checkElementBelowIsValid(
      ev,
      connectionMode,
      isTarget,
      nodeId,
      handleId,
      isValidConnection,
      doc,
    );

    if (!isHoveringHandle) {
      resetRecentHandle(recentHoveredHandle);
      return;
    }

    const isOwnHandle = connection.source === connection.target;
    console.log({ isOwnHandle });
    if (!isOwnHandle && elementBelow) {
      recentHoveredHandle = elementBelow;
      elementBelow.classList.add('react-flow__handle-connecting');
      elementBelow.classList.toggle('react-flow__handle-valid', isValid);
    }
  }

  function onMouseUp(ev: MouseEvent) {
    const { connection, isValid } = checkElementBelowIsValid(
      ev,
      connectionMode,
      isTarget,
      nodeId,
      handleId,
      isValidConnection,
      doc,
    );

    onConnectStop?.(ev);

    if (isValid) {
      onConnect?.(connection);
    }

    onConnectEnd?.(ev);

    if (elementEdgeUpdaterType && onEdgeUpdateEnd) {
      onEdgeUpdateEnd(ev);
    }

    resetRecentHandle(recentHoveredHandle);
    setState({
      connectionNodeId: null,
      connectionHandleId: null,
      connectionHandleType: null,
    });

    doc.removeEventListener('mousemove', onMouseMove as EventListenerOrEventListenerObject);
    doc.removeEventListener('mouseup', onMouseUp as EventListenerOrEventListenerObject);
  }

  doc.addEventListener('mousemove', onMouseMove as EventListenerOrEventListenerObject);
  doc.addEventListener('mouseup', onMouseUp as EventListenerOrEventListenerObject);
}

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
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.7em',
          color: 'white',
          height: '1.4em',
          borderRadius: '4px',
          transform: (type === 'target' ? 'translateX(-4em) ' : ' ') + (NodeTypeData[labelType].transform ?? ''),
          ...NodeTypeStyle[labelType],
        }}
      >
        {type === 'target' ? '○' : ''}
        {NodeTypeData[labelType].label}

        {type === 'source' ? '→' : ''}
        {children}
      </Paper>
    );
  },
);

Handle.displayName = 'Handle';

export default memo(Handle);
