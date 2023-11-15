import { Button, Container, Flex, HStack, useToast } from '@chakra-ui/react';
import KanbanList from './KanbanList';
import { KanbanListModel } from '../../types/kanban-list';
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	TouchSensor,
	closestCorners,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { v4 as uuid } from 'uuid';

import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { KanbanTaskModel } from '../../types/kanban-task';
import { useEffect, useId, useMemo, useReducer, useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { createPortal } from 'react-dom';
import KanbanCard from './KanbanCard';
import { KanbanBoardModel } from '../../types/kanban-board';
import { listService } from '../../services/list.service';
import { taskService } from '../../services/task.service';
import { POSITION_INTERVAL } from '../common/constants';
import CreateListBox from './CreateListBox';

export default function KanbanBoard({
	board,
	mutate,
	user,
}: {
	board: KanbanBoardModel;
	mutate: any;
	user: any;
}) {
	const toast = useToast();
	const dndId = useId();
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);

	const [activeList, setActiveList] = useState<KanbanListModel | null>(null);
	const [activeTask, setActiveTask] = useState<KanbanTaskModel | null>(null);
	const [isCreatingList, setIsCreatingList] = useState(false);
	const [isMovingAcrossLists, setIsMovingAcrossLists] = useState(false);

	const isDraggingTask = activeTask?.id ? true : false;
	const isDraggingList = activeList?.id ? true : false;

	const lists = useMemo(() => board.lists, [board]);
	const listsId = useMemo(() => lists.map((list) => list.id), [lists]);
	function findList(listId: string) {
		// console.log('finding list', listId);
		return lists.findIndex((list) => list.id === listId);
	}

	async function handleCreateList(event: any) {
		setIsCreatingList(false);
		if (event.target.value.length === 0) return;
		let position =
			lists.length > 0
				? lists[lists.length - 1].position + POSITION_INTERVAL
				: POSITION_INTERVAL;
		try {
			let newList = {
				name: event.target.value,
				position: position,
				boardId: board.id,
			};
			let optimisticList = {
				...newList,
				id: uuid() + 'temporary',
				tasks: [],
				synced: false,
			};
			await mutate(
				async (board: KanbanBoardModel) => {
					const createdList = await listService.createList(
						newList,
						user.accessToken,
					);
					// console.log('newlist:', createdList);

					return {
						...board,
						lists: [...lists, createdList],
					};
				},
				{
					optimisticData: { ...board, lists: [...lists, optimisticList] },
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
			toast({
				status: 'success',
				title: 'Created list:' + newList.name,
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		} catch (e) {
			// console.log(e);
			toast({
				status: 'error',
				title: 'Could not create list, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	}
	async function updateList(id: string, updatedList: Partial<KanbanListModel>) {
		try {
			await mutate(
				async (board: KanbanBoardModel) => {
					const updatedListInDb = await listService.updateList(
						updatedList,
						user.accessToken,
					);
					return {
						...board,
						lists: lists.map((list) =>
							list.id === id ? { ...list, ...updatedListInDb } : list,
						),
					};
				},
				{
					optimisticData: {
						...board,
						lists: lists.map((list) => (list.id === id ? updatedList : list)),
					},
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
			return updatedList;
		} catch (e: any) {
			// console.log(e);
			toast({
				status: 'error',
				title:
					'Could not update list, please try again, error:' +
					e.response.data.message,
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	}
	async function deleteList(id: string) {
		try {
			await mutate(
				async (board: KanbanBoardModel) => {
					await listService.deleteList(id, user.accessToken).then((res) => {
						// console.log('DELETED', res);
					});
					return {
						...board,
						lists: lists.filter((list) => list.id !== id),
					};
				},
				{
					optimisticData: {
						...board,
						lists: lists.filter((list) => list.id !== id),
					},
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
			toast({
				status: 'success',
				title: 'Deleted list',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		} catch (e) {
			toast({
				status: 'error',
				title: 'Could not delete list, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	}
	async function createTask(name: string, listId: string, position: number) {
		try {
			let newTask: Partial<KanbanTaskModel> = {
				listId: listId,
				name: name,
				position: position,
			};
			let optimisticTask = {
				description: '',
				assignments: [],
				tags: [],
				...newTask,
				id: uuid() + 'temporary',
			};
			await mutate(
				async (board: KanbanBoardModel) => {
					const createdTask = await taskService.createTask(
						newTask,
						user.accessToken,
					);
					return {
						...board,
						lists: lists.map((list) =>
							list.id === listId
								? { ...list, tasks: [...list.tasks, createdTask] }
								: list,
						),
					};
				},
				{
					optimisticData: {
						...board,
						lists: lists.map((list) =>
							list.id === listId
								? { ...list, tasks: [...list.tasks, optimisticTask] }
								: list,
						),
					},
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
			toast({
				status: 'success',
				title: 'Created task ' + newTask.name,
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		} catch (e) {
			// console.log(e);
			toast({
				status: 'error',
				title: 'Could not create task, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	}

	async function updateTask(id: string, updatedTask: KanbanTaskModel) {
		try {
			await mutate(
				async (board: KanbanBoardModel) => {
					const updatedTaskInDb = await taskService.updateTask(
						updatedTask,
						user.accessToken,
					);
					return {
						...board,
						lists: lists.map((list) =>
							list.id === updatedTaskInDb.listId
								? {
										...list,
										tasks: list.tasks.map((task) =>
											task.id === id ? updatedTaskInDb : task,
										),
								  }
								: list,
						),
					};
				},
				{
					optimisticData: {
						...board,
						lists: lists.map((list) =>
							list.id === updatedTask.listId
								? {
										...list,
										tasks: list.tasks.map((task) =>
											task.id === id ? updatedTask : task,
										),
								  }
								: list,
						),
					},
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
		} catch (e) {
			// console.log(e);
			toast({
				status: 'error',
				title: 'Could not update list, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	}
	async function deleteTask(id: string, listId: string) {
		try {
			await mutate(
				async (board: KanbanBoardModel) => {
					await taskService.deleteTask(id, user.accessToken).then((res) => {
						// console.log('DELETED', res);
					});
					return {
						...board,
						lists: lists.map((list) =>
							list.id === listId
								? {
										...list,
										tasks: list.tasks.filter((task) => task.id !== id),
								  }
								: list,
						),
					};
				},
				{
					optimisticData: {
						...board,
						lists: lists.map((list) =>
							list.id === listId
								? {
										...list,
										tasks: list.tasks.filter((task) => task.id !== id),
								  }
								: list,
						),
					},
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
			toast({
				status: 'success',
				title: 'Deleted task',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		} catch (e) {
			toast({
				status: 'error',
				title: 'Could not delete task, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	}

	function handleDragStart(event: any) {
		if (event.active.data.current?.type === 'list') {
			setActiveList(event.active.data.current?.list);
			return;
		}
		if (event.active.data.current?.type === 'task') {
			setActiveTask(event.active.data.current?.task);
			return;
		}
	}

	const handleDragCancel = (event: any) => {
		handleDragEnd(event);
	};
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

			if (activeListIndex === overListIndex) {
				return;
			}
			//
			if (activeListIndex !== overListIndex) {
				// Sorting items in different lists
				// console.log('sorting items in different lists');
				setIsMovingAcrossLists(true);
				let newLists = [...lists];
				let [removedTask] = newLists[activeListIndex].tasks.splice(
					activeTaskIndex,
					1,
				);
				removedTask.listId = lists[overListIndex].id;

				// newLists[overListIndex].tasks.splice(overTaskIndex, 0, removedTask);
				newLists[overListIndex].tasks.push(removedTask);

				mutate(
					(board: KanbanBoardModel) => {
						return { ...board, lists: newLists };
					},
					{ revalidate: false, rollbackOnError: true },
				);
			}
		}
		//Dropping an item into a list
		if (activeType === 'task' && overType === 'list') {
			// if (isMovingAcrossLists) return;
			// console.log('dropping item into a list');
			setIsMovingAcrossLists(true);
			let activeListIndex = findList(active.data.current.task.listId);
			let overListIndex = lists.findIndex((list) => list.id === over.id);
			// If active or over list is not found, return
			if (!lists[activeListIndex] || !lists[overListIndex]) {
				return;
			}
			if (activeListIndex === overListIndex) {
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
			mutate(
				(board: KanbanBoardModel) => {
					return { ...board, lists: newLists };
				},
				{
					revalidate: false,
					rollbackOnError: true,
				},
			);
		}
	};
	const handleDragEnd = async (event: any) => {
		// task and list after drag end are updated
		// console.log(activeTask);
		// console.log(activeList);

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
				// console.log('moved list', activeListIndex, 'to', overListIndex);
				try {
					let newPos = lists[activeListIndex].position;
					// console.log('Moving into', lists[overListIndex].position);
					if (overListIndex === 0) {
						newPos = lists[overListIndex].position / 2;
						// console.log(
						// 	'Moving list into the start of board with new position:',
						// 	newPos,
						// );
					} else if (overListIndex === lists.length - 1) {
						newPos = lists[overListIndex].position + POSITION_INTERVAL;
						// console.log(
						// 	'Moving list into the end of board with new position:',
						// 	newPos,
						// );
					} else {
						let diff = 0;
						if (activeListIndex < overListIndex) diff = 1;
						else diff = -1;
						// console.log(
						// 	'Moving into between 2 lists with positions:',
						// 	lists[overListIndex].position,
						// 	'and',
						// 	lists[overListIndex + diff].position,
						// );

						newPos =
							(lists[overListIndex].position +
								lists[overListIndex + diff].position) /
							2;
					}

					let optimisticLists = [...lists];
					optimisticLists[activeListIndex].position = newPos;
					mutate(
						async (board: KanbanBoardModel) => {
							//update list positions

							// console.log(active.id, lists[activeListIndex]);
							const updatedListInDb = await listService.updateList(
								{
									...activeList,
									position: newPos,
								},
								user.accessToken,
							);
							// console.log('updated list with new position', newPos);
							return {
								...board,
								lists: arrayMove(
									optimisticLists,
									activeListIndex,
									overListIndex,
								),
							};
						},
						{
							optimisticData: {
								...board,
								lists: arrayMove(
									optimisticLists,
									activeListIndex,
									overListIndex,
								),
							},
							rollbackOnError: true,
							populateCache: true,
							// revalidate has to be true? due to server-side reordering can trigger sometimes if difference is less than threshold
							// can be done with websocket later
							revalidate: false,
						},
					);
				} catch (e) {
					toast({
						status: 'error',
						title: 'Could not move list, please try again',
						isClosable: true,
						position: 'bottom-left',
						variant: 'left-accent',
					});
				}
			}
		}

		// Handle Items Sorting
		if (activeType === 'task' && overType === 'task') {
			// Find the index of active and over list inside lists array
			let activeListIndex = findList(active.data.current.task.listId);
			let overListIndex = findList(over.data.current.task.listId);
			// console.log(active.data.current.task, over.data.current.task);
			// console.log(activeListIndex, overListIndex);

			// If active or over list is not found, return
			if (activeListIndex < 0 || overListIndex < 0) return;

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
			// if (activeTaskIndex < 0 || overTaskIndex < 0) return;

			if (activeListIndex === overListIndex) {
				// console.log(
				// 	'moving tasks from the same list from',
				// 	activeTaskIndex,
				// 	'to',
				// 	overTaskIndex,
				// );

				let newPos = lists[activeListIndex].tasks[activeTaskIndex].position;
				try {
					// console.log(
					// 	'Moving into',
					// 	lists[activeListIndex].tasks[overTaskIndex].position,
					// );
					// console.log('task is moving from another list:', isMovingAcrossLists);
					if (!isMovingAcrossLists && activeTaskIndex === overTaskIndex) return;

					if (overTaskIndex === 0) {
						if (lists[overListIndex].tasks.length > 1)
							newPos = lists[overListIndex].tasks[overTaskIndex].position / 2;
						// console.log(
						// 	'Moving task into the start of list with new position:',
						// 	newPos,
						// );
					} else if (overTaskIndex === lists[overListIndex].tasks.length - 1) {
						if (isMovingAcrossLists)
							//tasks that are moved across lists are inserted at the end of the list, therefore the real last task is always the second to last
							newPos =
								lists[overListIndex].tasks[
									lists[overListIndex].tasks.length - 2
								].position + POSITION_INTERVAL;
						else
							newPos =
								lists[overListIndex].tasks[
									lists[overListIndex].tasks.length - 1
								].position + POSITION_INTERVAL;
						// console.log(
						// 	'Moving task into the end of list with new position:',
						// 	newPos,
						// );
					} else {
						let diff = 0;
						if (activeTaskIndex < overTaskIndex) diff = 1;
						else diff = -1;
						if (isMovingAcrossLists) diff = -1;
						// console.log(
						// 	'Moving task into between 2 tasks with positions:',
						// 	overTaskIndex,
						// 	'and',
						// 	overTaskIndex + diff,
						// );
						newPos =
							(lists[overListIndex].tasks[overTaskIndex].position +
								lists[overListIndex].tasks[overTaskIndex + diff].position) /
							2;
					}

					let optimisticLists = [...lists];
					optimisticLists[overListIndex].tasks[activeTaskIndex].position =
						newPos;
					optimisticLists[overListIndex].tasks = arrayMove(
						optimisticLists[overListIndex].tasks,
						activeTaskIndex,
						overTaskIndex,
					);
					mutate(
						async (board: KanbanBoardModel) => {
							//update task positions

							// console.log(active.id, lists[activeListIndex]);
							const updatedTaskInDb = await taskService.updateTask(
								{
									...activeTask,
									position: newPos,
									listId: lists[overListIndex].id,
								},
								user.accessToken,
							);
							// console.log('updated task with new position', updatedTaskInDb);
							return {
								...board,
								lists: optimisticLists,
							};
						},
						{
							optimisticData: {
								...board,
								lists: optimisticLists,
							},
							rollbackOnError: true,
							populateCache: true,
							// revalidate has to be true due to server-side reordering can trigger sometimes if difference is less than threshold
							revalidate: false,
						},
					);
				} catch (e) {
					toast({
						status: 'error',
						title: 'Could not move task, please try again',
						isClosable: true,
						position: 'bottom-left',
						variant: 'left-accent',
					});
				}
			}
			if (activeListIndex !== overListIndex) {
				// console.log('sorting items from different list in dragend');
			}
		}

		setIsMovingAcrossLists(false);
		return;
	};
	return (
		<Container maxW={'100%'} p={0}>
			<DndContext
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
				onDragCancel={handleDragCancel}
				sensors={sensors}
				id={dndId}
			>
				<Container
					maxW={'100%'}
					h="100%"
					bgColor={board.backgroundColor ? board.backgroundColor : 'blue.100'}
					p={0}
				>
					<HStack
						spacing={8}
						alignItems={'start'}
						overflowX={'auto'}
						overflowY={'hidden'}
						h={{ base: '88vh', md: '88.4vh', lg: '88.5vh' }}
						// pt={4}
						// pl={4}
						// pr={{ base: 0, xl: 4 }}
						p={4}
						pb={5}
						pr={{ base: 6 }}
						css={{
							scrollbarColor: 'auto',

							'&::-webkit-scrollbar': {
								width: '16px',
								height: '16px',
							},
							'&::-webkit-scrollbar-track': {
								width: '0px',
								border: 'solid 10px transparent',
							},
							'&::-webkit-scrollbar-thumb': {
								background: '#757575',
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
							{board.lists.map((list: KanbanListModel) => {
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
							{!isCreatingList ? (
								<Button
									size="md"
									height="100px"
									width="284px"
									leftIcon={<AddIcon />}
									variant="solid"
									border="1px solid black"
									onClick={() => setIsCreatingList(true)}
								>
									Add List
								</Button>
							) : (
								<CreateListBox
									handleCreateList={handleCreateList}
									setIsCreatingList={setIsCreatingList}
								/>
							)}
						</Flex>
					</HStack>
				</Container>
				{typeof window === 'object' &&
					createPortal(
						<DragOverlay dropAnimation={null}>
							<div
								style={{
									transform: 'rotate(4deg)',
									opacity: 0.4,
								}}
							>
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
										isDragOverlay={true}
									/>
								)}
							</div>
						</DragOverlay>,
						document.body,
					)}
			</DndContext>
		</Container>
	);
}
