import { Container, HStack, Stack } from '@chakra-ui/react';
import KanbanList from './KanbanList';
import { KanbanListModel } from '../../types/kanban-list';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanTaskModel } from '../../types/kanban-task';
import { useState } from 'react';
import KanbanCard from './KanbanCard';
const mockBoard = {
	lists: [
		{
			id: 'aad7949d-fa6b-4e69-be61-32b1d998eab0',
			name: 'updated name for list',
			position: 1024,
			tasks: [
				{
					id: '1',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '3',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
		{
			id: '26d603cf-e160-4d1f-9325-5dd291498493',
			name: 'new list 2334',
			position: 8192,
			tasks: [
				{
					id: '4',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '5',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '6',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
		{
			id: 'f79e20fa-fea1-49a4-82ab-41c3fb98e899',
			name: 'new list 2334',
			position: 16384,
			tasks: [
				{
					id: '7',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '8',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '9',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
	],
};

export default function KanbanBoard() {
	let [mockLists, setMockLists] = useState(mockBoard.lists);
	const renderLists = mockLists.map((list: KanbanListModel) => {
		return <KanbanList list={list} key={list.id} />;
	});

	const [activeId, setActiveId] = useState(null);
	function handleDragStart(event: any) {
		setActiveId(event.active.id);
	}

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (active.id !== over.id) {
			console.log('dragged from ', active.id, ' to ', over.id);
			//   setMockLists((items) => {
			//     const oldIndex = items.indexOf(active.id);
			//     const newIndex = items.indexOf(over.id);
			//     return arrayMove(items, oldIndex, newIndex);
			//   });
		}
		setActiveId(null);
	};
	//TODO: Refactor to use simplegrid
	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Container maxW={'container.lg'} maxH={'99vh'} overflow={'auto'}>
				<HStack spacing={10}>
					{/* <SortableContext items={listIds}> */}
					{renderLists}
					{/* </SortableContext> */}
				</HStack>
			</Container>
			{/* <DragOverlay> */}
			{/* {activeId ? <KanbanCard task={mockLists[0][0]} /> : null} */}
			{/* </DragOverlay> */}
		</DndContext>
	);
}
