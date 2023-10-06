export interface KanbanTaskModel {
	id: string;

	listId: string;

	name: string;

	description: string | null;

	position: number;

	// createdAt: Date;

	// updatedAt: Date;

	// creator: User;
}
