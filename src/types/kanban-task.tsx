import { KanbanBoardModel } from './kanban-board';
import { KanbanListModel } from './kanban-list';

export interface KanbanTaskModel {
	id: string;

	name: string;

	description: string;

	position: number;

	// createdAt: Date;

	// updatedAt: Date;

	// creator: User;
}
