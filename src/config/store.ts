import { syncedStore, getYjsDoc } from '@syncedstore/core';
import { KanbanBoardModel } from '../types/kanban-board';
const WebrtcProvider = require('y-webrtc').WebrtcProvider;

// Create your SyncedStore store
export const store = syncedStore({
	board: {} as KanbanBoardModel,
	fragment: 'xml',
});

// Create a document that syncs automatically using Y-WebRTC
const doc = getYjsDoc(store);
export const webrtcProvider = new WebrtcProvider('syncedstore-kantan', doc);

export const disconnect = () => webrtcProvider.disconnect();
export const connect = () => webrtcProvider.connect();
