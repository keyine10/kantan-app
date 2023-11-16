import { KanbanListModel } from './kanban-list';
import { KanbanTaskModel } from './kanban-task';
import { User } from './user';

export interface KanbanBoardModel {
	id: string;

	title: string;

	description: string;

	createdAt: Date;

	updatedAt: Date;

	// creator: User;

	backgroundColor: string;

	creatorId: number;

	creator: User;

	members: User[];

	pendingMembers: string[];

	lists: KanbanListModel[];

	tasks: KanbanTaskModel[];
}
