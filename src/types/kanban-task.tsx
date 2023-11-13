export interface KanbanTaskModel {
	id: string;

	listId: string;

	name: string;

	description: string | null;

	position: number;

	backgroundColor: string;

	attachments: any;

	tags: any;

	// createdAt: Date;

	// updatedAt: Date;

	// creator: User;
}
