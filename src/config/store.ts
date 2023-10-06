import { syncedStore, getYjsDoc } from '@syncedstore/core';
import { KanbanBoardModel } from '../types/kanban-board';
const WebsocketProvider = require('y-websocket').WebsocketProvider;

// Create your SyncedStore store
export const store = syncedStore({
	board: {} as KanbanBoardModel,
	fragment: 'xml',
});

// Create a document that syncs automatically using Y-WebRTC
const doc = getYjsDoc(store);

const wsProvider = new WebsocketProvider(
	'ws://localhost:1234',
	'my-roomname',
	doc,
);
