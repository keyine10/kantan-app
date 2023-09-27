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

import { v4 as uuid } from 'uuid';

import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { KanbanTaskModel } from '../../types/kanban-task';
import { useId, useMemo, useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { createPortal } from 'react-dom';
import { store } from '../../config/store';
import { useSyncedStore } from '@syncedstore/react';
import KanbanCard from './KanbanCard';

const mockBoard = {
	lists: [
		{
			id: 'A',
			name: 'updated name for list',
			position: 1024,
			tasks: [
				{
					id: '1',
					listId: 'A',
					name: 'very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long ',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					listId: 'A',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
			],
		},
		{
			id: 'B',
			name: 'new list 2334',
			position: 16384,
			tasks: [
				{
					id: '7',
					listId: 'B',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '8',
					listId: 'B',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
			],
		},
		{
			id: 'C',
			name: 'new list 2334',
			position: 8192,
			tasks: [
				{
					id: '4',
					listId: 'C',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '5',
					listId: 'C',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '6',
					listId: 'C',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
	],
};

export default function KanbanBoard() {
	// const board = useSyncedStore(store);
	let [lists, setLists] = useState<KanbanListModel[]>(mockBoard.lists);
	const dndId = useId();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
	);
	const [activeList, setActiveList] = useState<KanbanListModel | null>(null);
	const [activeTask, setActiveTask] = useState<KanbanTaskModel | null>(null);

	const listsId = useMemo(() => lists.map((list) => list.id), [lists]);
	const isDraggingList = activeList?.id
		? listsId.includes(activeList.id)
		: false;
	const isDraggingTask = activeTask?.id ? true : false;

	function findList(listId: string) {
		// console.log('finding list', listId);
		return lists.findIndex((list) => list.id === listId);
	}

	function handleCreateList(event: any) {
		let newLists: KanbanListModel = {
			id: uuid(),
			name: 'new list #' + lists.length,
			position: lists.length * 10,
			tasks: [],
		};
		setLists([...lists, newLists]);
	}
	function updateList(id: string, updatedList: KanbanListModel) {
		setLists(lists.map((list) => (list.id === id ? updatedList : list)));
	}
	function deleteList(id: string) {
		setLists(lists.filter((list) => list.id !== id));
	}
	function createTask(listId: string, position: number) {
		console.log('Creating new task');
		let newTask: KanbanTaskModel = {
			id: uuid(),
			listId: listId,
			name:
				'new task #' + lists.find((list) => list.id === listId)?.tasks.length,
			description: '',
			position: position,
		};
		setLists((lists) => {
			lists.find((list) => list.id === listId)?.tasks.push(newTask);
			return [...lists];
		});
		console.log(newTask);
	}

	function updateTask(id: string, updatedTask: KanbanTaskModel) {
		setLists(
			lists.map((list) => {
				if (list.id === updatedTask.listId) {
					list.tasks = list.tasks.map((task) =>
						task.id === id ? updatedTask : task,
					);
				}
				return list;
			}),
		);
	}
	function deleteTask(id: string, listId: string) {
		setLists(
			lists.map((list) => {
				if (list.id === listId) {
					list.tasks = list.tasks.filter((task) => task.id !== id);
				}
				return list;
			}),
		);
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
		if (!active || !over) return;
		if (active.id === over.id) {
			return;
		}
		const activeType = active.data.current?.type;
		const overType = over.data.current?.type;
		//TODO: update position after moving
		if (!activeType) return;

		if (activeType === 'list') {
			return;
		}

		// Handle Items Sorting
		if (activeType === 'task' && overType === 'task') {
			// console.log(active.data.current.task.listId);

			// Find the index of active and over list inside lists array
			let activeListIndex = findList(active.data.current.task.listId);
			let overListIndex = findList(over.data.current.task.listId);

			// If active or over list is not found, return
			if (!lists[activeListIndex] || !lists[overListIndex]) {
				return;
			}

			// Find the index of the active and over task

			let activeTaskIndex = lists[activeListIndex].tasks.findIndex(
				(task) => task.id === active.data.current.task.id,
			);
			let overTaskIndex = lists[overListIndex].tasks.findIndex(
				(task) => task.id === over.data.current.task.id,
			);

			// console.log(
			// 	'Moving task from list #',
			// 	activeListIndex,
			// 	'position',
			// 	activeTaskIndex,
			// 	'to list #',
			// 	overListIndex,
			// 	'position',
			// 	overTaskIndex,
			// );

			//only call setLists here if the lists are not the same

			if (activeListIndex !== overListIndex) {
				// Sorting items in different lists
				setLists((lists) => {
					let newLists = lists;
					let [removedTask] = newLists[activeListIndex].tasks.splice(
						activeTaskIndex,
						1,
					);
					removedTask.listId = over.data.current.task.listId;

					newLists[overListIndex].tasks.splice(overTaskIndex, 0, removedTask);
					return newLists;
				});

				// setLists(newLists);
			}
		}
		//Dropping an item into a list
		if (activeType === 'task' && overType === 'list') {
			console.log('dropping item into a list');
			let activeListIndex = findList(active.data.current.task.listId);
			let overListIndex = lists.findIndex((list) => list.id === over.id);
			// If active or over list is not found, return
			if (!lists[activeListIndex] || !lists[overListIndex]) {
				return;
			}

			// Find the index of the active task
			let activeTaskIndex = lists[activeListIndex].tasks.findIndex(
				(task) => task.id === active.data.current.task.id,
			);
			// Remove task from active list and add to over list
			let newLists = [...lists];
			const [removedTask] = newLists[activeListIndex].tasks.splice(
				activeTaskIndex,
				1,
			);
			removedTask.listId = over.id;
			newLists[overListIndex].tasks.push(removedTask);
			setLists(newLists);
		}
	};
	const handleDragEnd = (event: any) => {
		// task and list after drag end are updated
		console.log(activeTask);
		console.log(activeList);

		// setActive to null to remove DragOverlay
		setActiveTask(null);
		setActiveList(null);

		const { active, over } = event;
		if (!over) return;
		const activeType = active.data.current?.type;
		const overType = over.data.current?.type;

		// handle list sorting
		if (activeType === 'list' && overType === 'list' && active.id !== over.id) {
			if (active.id !== over.id) {
				const activeListIndex = lists.findIndex(
					(list) => list.id === active.id,
				);
				const overListIndex = lists.findIndex((list) => list.id === over.id);
				//TODO:update list positions
				setLists(arrayMove(lists, activeListIndex, overListIndex));
			}
		}

		// Handle Items Sorting
		if (activeType === 'task' && overType === 'task') {
			// Find the index of active and over list inside lists array
			let activeListIndex = findList(active.data.current.task.listId);
			let overListIndex = findList(over.data.current.task.listId);

			// If active or over list is not found, return
			if (!lists[activeListIndex] || !lists[overListIndex]) {
				return;
			}

			// Find the index of the active and over task

			let activeTaskIndex = lists[activeListIndex].tasks.findIndex(
				(task) => task.id === active.data.current.task.id,
			);
			let overTaskIndex = lists[overListIndex].tasks.findIndex(
				(task) => task.id === over.data.current.task.id,
			);

			if (activeListIndex === overListIndex) {
				setLists((lists) => {
					// console.log('moving tasks from the same list');
					let newLists = [...lists];
					// console.log('before moving', newLists[activeListIndex].tasks);
					let currentTasks = arrayMove(
						newLists[activeListIndex].tasks,
						activeTaskIndex,
						overTaskIndex,
					);
					// console.log('after moving', currentTasks);
					newLists[activeListIndex].tasks.splice(
						0,
						currentTasks.length,
						...currentTasks,
					);
					// console.log(newLists[activeListIndex].tasks);
					return lists;
				});
			} else {
				// Moving items between lists
				// TODO: api calls here
			}
		}
		// else {
		// 		// Sorting items in different lists
		// 		let newLists = [...lists];
		// 		let [removedTask] = newLists[activeListIndex].tasks.splice(
		// 			activeTaskIndex,
		// 			1,
		// 		);
		// 		newLists[overListIndex].tasks.splice(overTaskIndex, 0, removedTask);
		// 		removedTask.listId = over.data.current.task.listId;

		// 		setLists(newLists);
		// 	}
		// }
		// //Dropping an item into a list
		// if (activeType === 'task' && overType === 'list') {
		// 	console.log('dropping item into a list');
		// 	let activeListIndex = findList(active.data.current.task.listId);
		// 	let overListIndex = lists.findIndex((list) => list.id === over.id);
		// 	// If active or over list is not found, return
		// 	if (!lists[activeListIndex] || !lists[overListIndex]) {
		// 		return;
		// 	}

		// 	// Find the index of the active task
		// 	let activeTaskIndex = lists[activeListIndex].tasks.findIndex(
		// 		(task) => task.id === active.data.current.task.id,
		// 	);
		// 	// Remove task from active list and add to over list
		// 	let newLists = [...lists];
		// 	const [removedTask] = newLists[activeListIndex].tasks.splice(
		// 		activeTaskIndex,
		// 		1,
		// 	);
		// 	newLists[overListIndex].tasks.push(removedTask);
		// 	setLists(newLists);
		// }

		return;
	};
	return (
		<DndContext
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			sensors={sensors}
			id={dndId}
		>
			<Container maxW={'100%'} h={'92.9vh'} bgColor={'blue.100'} p={0}>
				<HStack
					h="100%"
					spacing={8}
					alignItems={'start'}
					overflowX={'auto'}
					overflowY={'hidden'}
					pt={4}
					pl={4}
					css={{
						'scrollbar-color': 'auto',

						'&::-webkit-scrollbar': {
							width: '16px',
							height: '16px',
						},
						'&::-webkit-scrollbar-track': {
							width: '0px',
							border: 'solid 10px transparent',
						},
						'&::-webkit-scrollbar-thumb': {
							background: 'black',
							borderRadius: '16px',
							backgroundClip: 'content-box',
							border: 'solid 3px transparent',
						},
					}}
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
									isDraggingTask={isDraggingTask}
									createTask={createTask}
									updateTask={updateTask}
									deleteTask={deleteTask}
									updateList={updateList}
									deleteList={deleteList}
									tasks={list.tasks}
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
								isDraggingTask={isDraggingTask}
								tasks={activeList.tasks}
								createTask={createTask}
								updateTask={updateTask}
								deleteTask={deleteTask}
								updateList={updateList}
								deleteList={deleteList}
							/>
						)}
						{activeTask && (
							<KanbanCard
								task={activeTask}
								key={activeTask.id}
								isDraggingList={isDraggingList}
								updateTask={updateTask}
								deleteTask={deleteTask}
							/>
						)}
					</DragOverlay>,
					document.body,
				)}
		</DndContext>
	);
}
