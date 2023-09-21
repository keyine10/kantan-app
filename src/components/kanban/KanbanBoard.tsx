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

import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { KanbanTaskModel } from '../../types/kanban-task';
import { useMemo, useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { createPortal } from 'react-dom';
import { store } from '../../config/store';
import { useSyncedStore } from '@syncedstore/react';
import KanbanCard from './KanbanCard';

const mockBoard = {
	tasks: [
		{
			id: '1',
			listId: '1',
			name: 'new task',
			description: 'new task description 1',
			position: 1,
		},
		{
			id: '2',
			listId: '1',
			name: 'new task 1',
			description: 'new task description 2',
			position: 2,
		},
		{
			id: '7',
			listId: '2',
			name: 'new task',
			description: 'new task description 1',
			position: 1,
		},
		{
			id: '8',
			listId: '2',
			name: 'new task 1',
			description: 'new task description 2',
			position: 2,
		},
		{
			id: '4',
			listId: '3',
			name: 'new task',
			description: 'new task description 1',
			position: 1,
		},
		{
			id: '5',
			listId: '3',
			name: 'new task 1',
			description: 'new task description 2',
			position: 2,
		},
		{
			id: '6',
			listId: '3',
			name: 'new task 2',
			description: 'new task description 3',
			position: 3,
		},
	],
	lists: [
		{
			id: '1',
			name: 'updated name for list',
			position: 1024,
		},
		{
			id: '2',
			name: 'new list 2334',
			position: 16384,
		},
		{
			id: '3',
			name: 'new list 2334',
			position: 8192,
			tasks: [],
		},
	],
};

export default function KanbanBoard() {
	// const board = useSyncedStore(store);
	let [lists, setLists] = useState<KanbanListModel[]>([]);
	let [tasks, setTasks] = useState<KanbanTaskModel[]>([]);

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
			id: (Math.random() * 1).toString(),
			name: 'new list #' + lists.length,
			position: 0,
		};
		setLists([...lists, newList]);
	}
	function updateList(id: string, updatedList: KanbanListModel) {
		setLists(lists.map((list) => (list.id === id ? updatedList : list)));
	}
	function deleteList(id: string) {
		setLists(lists.filter((list) => list.id !== id));
		setTasks(tasks.filter((task) => task.listId !== id));
	}
	function createTask(listId: string) {
		console.log('Creating new task');
		let newTask: KanbanTaskModel = {
			id: Math.random().toString(36),
			listId: listId,
			name: 'new task #' + `${tasks.length + 1}`,
			description: '',
			position: 0,
		};
		setTasks([...tasks, newTask]);
	}

	function updateTask(id: string, updatedTask: KanbanTaskModel) {
		setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
	}
	function deleteTask(id: string) {
		setTasks(tasks.filter((task) => task.id !== id));
	}

	function handleDragStart(event: any) {
		// console.log(
		// 	'START DRAGGING',
		// 	event.active.data.current?.type,
		// 	event.active.data.current[event.active.data.current?.type],
		// );
		if (event.active.data.current?.type === 'list') {
			setActiveList(event.active.data.current?.list);
			return;
		}
		if (event.active.data.current?.type === 'task') {
			setActiveTask(event.active.data.current?.task);
			return;
		}
	}

	const handleDragOver = (event: any) => {
		const { active, over } = event;
		if (!over) return;
		if (active.id === over.id) {
			return;
		}
		const activeType = active.data.current?.type;
		const overType = over.data.current?.type;
		//TODO: update position after moving
		if (!activeType) return;

		//dropping a task over another task
		if (activeType === 'task' && overType === 'task') {
			console.log('dropping task over another task');
			console.log(active, over);
			setTasks((tasks) => {
				const activeTaskIndex = tasks.findIndex(
					(task) => task.id === active.data.current?.task.id,
				);
				const overTaskIndex = tasks.findIndex(
					(task) => task.id === over.data.current?.task.id,
				);
				tasks[activeTaskIndex].listId = tasks[overTaskIndex].listId;
				//TODO: update position
				tasks[activeTaskIndex].position = tasks[overTaskIndex].position - 1;
				setActiveTask(tasks[activeTaskIndex]);
				return arrayMove(tasks, activeTaskIndex, overTaskIndex);
			});
		}
		//dropping a task over a list: set task.listId = over.id
		if (activeType === 'task' && overType === 'list') {
			console.log('dropping task over list');
			setTasks((tasks) => {
				const activeTaskIndex = tasks.findIndex(
					(task) => task.id === active.data.current?.task.id,
				);
				tasks[activeTaskIndex].listId = over.id;
				return arrayMove(tasks, activeTaskIndex, activeTaskIndex);
			});
		}
		// if (activeType === 'list' && overType === 'list') {
		// 	const activeListIndex = lists.findIndex((list) => list.id === active.id);
		// 	const overListIndex = lists.findIndex((list) => list.id === over.id);
		// 	setLists(arrayMove(lists, activeListIndex, overListIndex));
		// 	console.log('dragging a list');
		// }
	};

	const handleDragEnd = (event: any) => {
		// task and list after drag end are updated
		console.log(activeTask);
		console.log(activeList);

		// setActive to null to remove DragOverlay
		setActiveTask(null);
		setActiveList(null);

		const { active, over } = event;
		const activeType = active.data.current?.type;
		const overType = over.data.current?.type;

		if (!over) return;
		if (activeType === 'list' && overType === 'list') {
			if (active.id !== over.id) {
				const activeListIndex = lists.findIndex(
					(list) => list.id === active.id,
				);
				const overListIndex = lists.findIndex((list) => list.id === over.id);
				setLists(arrayMove(lists, activeListIndex, overListIndex));
			}
		}

		return;
	};
	return (
		<DndContext
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
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
									createTask={createTask}
									updateTask={updateTask}
									deleteTask={deleteTask}
									updateList={updateList}
									deleteList={deleteList}
									tasks={tasks.filter((task) => task.listId === list.id)}
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
					<DragOverlay modifiers={[restrictToWindowEdges]}>
						{activeList && (
							<KanbanList
								list={activeList}
								key={activeList.id}
								isDraggingList={isDraggingList}
								tasks={tasks.filter((task) => task.listId === activeList.id)}
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
