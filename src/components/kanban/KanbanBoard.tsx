import { Box, Button, Container, Flex, HStack, Stack } from '@chakra-ui/react';
import KanbanList from './KanbanList';
import { KanbanListModel } from '../../types/kanban-list';
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	closestCenter,
	closestCorners,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	rectSwappingStrategy,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanTaskModel } from '../../types/kanban-task';
import { useMemo, useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { createPortal } from 'react-dom';
import { store } from '../../config/store';
import { useSyncedStore } from '@syncedstore/react';
import KanbanCard from './KanbanCard';

const mockBoard = {
	lists: [
		{
			id: '1',
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
			],
		},
		{
			id: '2',
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
				// {
				// 	id: '9',
				// 	name: 'new task 2',
				// 	description: 'new task description 3',
				// 	position: 3,
				// },
				// {
				// 	id: '3',
				// 	name: 'new task 2',
				// 	description: 'new task description 3',
				// 	position: 3,
				// },
			],
		},
		{
			id: '3',
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
	],
};

export default function KanbanBoard() {
	const board = useSyncedStore(store);
	let [lists, setLists] = useState<KanbanListModel[]>([]);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);
	const [activeList, setActiveList] = useState<KanbanListModel | null>(null);
	const [activeTask, setActiveTask] = useState<KanbanTaskModel | null>(null);

	const listsId = useMemo(() => lists.map((list) => list.id), [lists]);
	const isDraggingList = activeList?.id
		? listsId.includes(activeList.id)
		: false;
	function handleCreateList(event: any) {
		let newList: KanbanListModel = {
			name: 'new list #' + lists.length,
			position: 0,
			tasks: [],
			id: (Math.random() * 1).toString(),
		};
		setLists([...lists, newList]);
		console.log('added new list', newList);
		console.log(listsId);
	}
	function handleDragStart(event: any) {
		console.log('START DRAGGING', event.active.data.current?.type);
		if (event.active.data.current?.type === 'list') {
			setActiveList(event.active.data.current?.list);
			return;
		}
		if (event.active.data.current?.type === 'task') {
			setActiveTask(event.active.data.current?.task);
			return;
		}
	}

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (!over) return;
		if (active.id !== over.id) {
			console.log('dragged from ', active.id, ' to ', over.id);
			const activeListIndex = lists.findIndex((list) => list.id === active.id);
			const overListIndex = lists.findIndex((list) => list.id === over.id);
			setLists(arrayMove(lists, activeListIndex, overListIndex));
		}
		setActiveList(null);
		setActiveTask(null);
		return;
	};

	// const handleDragOver = (event: any) => {
	// 	const { active, over } = event;
	// 	if (!over) return;
	// 	if (active.id !== over.id) {
	// 		console.log('dragged from ', active.id, ' to ', over.id);
	// 		const activeListIndex = lists.findIndex((list) => list.id === active.id);
	// 		const overListIndex = lists.findIndex((list) => list.id === over.id);
	// 		setLists(arrayMove(lists, activeListIndex, overListIndex));
	// 	}
	// };

	const handleDragOver = (event: any) => {
		const { active, over } = event;
		if (!over) return;
		if (active.id !== over.id) {
			return;
		}
		console.log(active, over);
		// const activeListIndex = lists.findIndex((list) => list.id === active.id);
		// const overListIndex = lists.findIndex((list) => list.id === over.id);

		setActiveList(null);
		setActiveTask(null);
	};
	return (
		<DndContext
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			// onDragOver={handleDragOver}
			sensors={sensors}
		>
			<Container maxW={'100%'} h={'100vh'}>
				<HStack
					minH="100%"
					spacing={10}
					alignItems={'start'}
					overflow={'auto'}
					p={'4'}
				>
					<SortableContext
						items={listsId}
						strategy={horizontalListSortingStrategy}
					>
						{lists.map((list: KanbanListModel) => {
							return (
								<KanbanList
									list={list}
									key={list.id}
									isDraggingList={isDraggingList}
								/>
							);
						})}
					</SortableContext>
					<Flex maxH={{ base: '98vh', xl: '99vh' }} justifyContent={'end'}>
						<Button
							size="md"
							height="100px"
							width="272px"
							leftIcon={<AddIcon />}
							variant="solid"
							border="2px dashed black"
							onClick={handleCreateList}
						>
							Add Column
						</Button>
					</Flex>
				</HStack>
			</Container>
			{typeof window === 'object' &&
				createPortal(
					<DragOverlay>
						{activeList && (
							<KanbanList
								list={activeList}
								key={activeList.id}
								isDraggingList={isDraggingList}
							/>
						)}
						{activeTask && (
							<KanbanCard
								task={activeTask}
								key={activeTask.id}
								isDraggingList={isDraggingList}
							/>
						)}
					</DragOverlay>,
					document.body,
				)}
		</DndContext>
	);
}
