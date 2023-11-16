import { KanbanTaskModel } from './kanban-task';

export interface KanbanListModel {
	id: string;

	name: string;

	position: number;

	backgroundColor: string;

	tasks: KanbanTaskModel[];
}
