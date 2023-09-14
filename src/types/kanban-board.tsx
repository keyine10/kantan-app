import { KanbanListModel } from './kanban-list';
import { KanbanTaskModel } from './kanban-task';

export interface KanbanBoardModel {
	id: string;

	title: string;

	description: string;

	createdAt: Date;

	updatedAt: Date;

	// creator: User;

	creatorId: number;

	// members: User[];

	lists: KanbanListModel[];

	tasks: KanbanTaskModel[];
}
