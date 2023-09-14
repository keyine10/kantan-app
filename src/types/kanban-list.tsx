import { KanbanBoardModel } from './kanban-board';
import { KanbanTaskModel } from './kanban-task';

export interface KanbanListModel {
	id: string;

	name: string;

	position: number;

	tasks: KanbanTaskModel[];
}
