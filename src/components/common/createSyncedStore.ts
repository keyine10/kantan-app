// import { syncedStore, getYjsDoc } from '@syncedstore/core';
// import { KanbanBoardModel } from '../../types/kanban-board';
// const WebsocketProvider = require('y-websocket').WebsocketProvider;

// export const createSyncedStore = (id: string) => {
// 	const store = syncedStore({
// 		board: {} as KanbanBoardModel,
// 		fragment: 'xml',
// 	});
// 	const doc = getYjsDoc(store);

// 	const wsProvider = new WebsocketProvider(
// 		'ws://localhost:1234',
// 		'my-roomname' + id,
// 		doc,
// 	);
// 	wsProvider.setRoomName('my-roomname' + id);
// 	return store;
// };
