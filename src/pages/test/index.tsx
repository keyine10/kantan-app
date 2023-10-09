import { useRouter } from 'next/router';
import { ReactElement, useEffect, useMemo } from 'react';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';
import { useSyncedStore } from '@syncedstore/react';
import { Button } from '@chakra-ui/react';

import { v4 as uuid } from 'uuid';
import { syncedStore, getYjsDoc } from '@syncedstore/core';
import { KanbanBoardModel } from '../../types/kanban-board';
import KanbanList from '../../components/kanban/KanbanList';
const WebsocketProvider = require('y-websocket').WebsocketProvider;

export const store = syncedStore({
	board: {} as KanbanBoardModel,
	fragment: 'xml',
});

const mockBoard = {
	lists: [
		{
			id: 'A',
			name: 'updated name for list',
			position: 1024,
			tasks: [
				{
					id: '1',
					listId: 'A',
					name: 'very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long ',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					listId: 'A',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
			],
		},
		{
			id: 'B',
			name: 'new list 2334',
			position: 16384,
			tasks: [
				{
					id: '7',
					listId: 'B',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '8',
					listId: 'B',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
			],
		},
		{
			id: 'C',
			name: 'new list 2334',
			position: 8192,
			tasks: [
				{
					id: '4',
					listId: 'C',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '5',
					listId: 'C',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '6',
					listId: 'C',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
	],
};
export default function KanbanPage() {
	// Create a document that syncs automatically using Y-WebRTC
	const router = useRouter();
	let id = 'customid';
	const doc = getYjsDoc(store);

	const state = useSyncedStore(store);

	useEffect(() => {
		let wsProvider = new WebsocketProvider(
			'ws://localhost:1234',
			'my-roomname1123lkdmdaskldmlkmlad23123121' + id,
			doc,
		);

		wsProvider.on('sync', (isSynced: any) => {
			console.log('synced:', isSynced);
			if (isSynced && !state.board.lists) {
				state.board.lists = [];
				state.board.lists.push(...mockBoard.lists);
			}
		});
	}, [doc, id, state.board]);

	const handleAddList = () => {
		if (!state.board.lists) state.board.lists = [];
		state.board.lists.push({
			id: uuid(),
			name: 'new list ' + id,
			position: state.board.lists.length * 10,
			tasks: [],
		});
	};
	const handleDelete = () => {
		if (state.board.lists!.length < 1) return;
		state.board.lists?.splice(state.board.lists.length - 1, 1);
	};
	if (!state.board.lists) return null;
	return (
		<div style={{ height: '100vh' }}>
			<div>Hello test</div>
			{JSON.stringify(state.board)}
			<div>
				<Button onClick={handleAddList}> Add a new list</Button>
				<Button onClick={handleDelete}>Delete last list</Button>
			</div>
			{/* {state.board.lists?.map((list) => (
				<div>{list.name}</div>
			))}{' '} */}
		</div>
	);
}

KanbanPage.getLayout = function getLayout(page: ReactElement) {
	return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
