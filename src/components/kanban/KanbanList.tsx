import {
	Box,
	Heading,
	Stack,
	Text,
	Button,
	IconButton,
	Flex,
	Textarea,
} from '@chakra-ui/react';
import { KanbanListModel } from '../../types/kanban-list';
import KanbanCard from './KanbanCard';
import { KanbanTaskModel } from '../../types/kanban-task';
import { useMemo, useRef, useState } from 'react';
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
	rectSwappingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddIcon, HamburgerIcon, DeleteIcon } from '@chakra-ui/icons';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';

interface KanbanListProps {
	list: KanbanListModel;
	isDraggingList: boolean;
	tasks: KanbanTaskModel[];
	isDraggingTask: boolean;

	createTask: (listId: string, position: number) => void;
	updateTask: (id: string, updatedTask: KanbanTaskModel) => void;
	deleteTask: (id: string, listId: string) => void;

	updateList: (id: string, updatedlist: KanbanListModel) => void;
	deleteList: (id: string) => void;
}

export default function KanbanList({
	list,
	isDraggingList,
	isDraggingTask,
	createTask,
	updateTask,
	deleteTask,

	updateList,
	deleteList,
}: KanbanListProps) {
	const [isEditingListName, setIsEditingListName] = useState(false);
	const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: list.id,
		data: {
			type: 'list',
			list,
		},
	});

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};

	// let tasksId = useMemo(
	// 	() => list.tasks.map((task: KanbanTaskModel) => task.id),
	// 	[list.tasks.length],
	// );
	let tasksId = list.tasks.map((task: KanbanTaskModel) => task.id);

	//sorting tasks will cause a re-render when moving lists around, only employ sorted tasks when the position of the tasks are correct, otherwise it will seem incorrect

	// let sortedTasks = useMemo(
	// 	() =>
	// 		list.tasks.sort(
	// 			(a: KanbanTaskModel, b: KanbanTaskModel) => a.position - b.position,
	// 		),
	// 	[list.tasks],
	// );

	const handleCreateTask = (event: any) => {
		//fix duplicate create task by creating a new task while editing task name
		event.stopPropagation();
		setIsCreatingNewTask(false);
		createTask(list.id, list.tasks.length * 10);
	};

	const handleRenameList = (event: any) => {
		setIsEditingListName(false);
		updateList(list.id, { ...list, name: event.target.value });
	};

	const handleDeleteList = () => {
		deleteList(list.id);
	};
	return (
		<Box
			maxH={{ base: '94vh', xl: '93vh' }}
			rounded={'lg'}
			boxShadow={
				isDragging
					? 0
					: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;'
			}
			border={isDragging ? '2px dashed black' : 'none'}
			bgColor={'gray.50'}
			minWidth={'300px'}
			maxWidth={'304px'}
			ref={setNodeRef}
			style={style}
			zIndex={100}
		>
			<Flex direction="row" p={2} opacity={isDragging ? 0 : 1}>
				<div>
					<Heading fontSize={'md'} {...attributes} {...listeners}>
						{isEditingListName ? (
							<AutoResizeTextarea
								border={'none'}
								fontSize={16}
								resize={'none'}
								defaultValue={list.name}
								// focusBorderColor="none"
								onBlur={handleRenameList}
								onFocus={(event: any) => {
									event.target.selectionEnd = event.target.value.length;
								}}
								onKeyDown={(event: any) => {
									if (event.key === 'Enter') {
										handleRenameList(event);
										setIsEditingListName(false);
									}
									if (event.key === 'Escape') {
										setIsEditingListName(false);
									}
								}}
								ref={textareaRef}
								autoFocus
								size="sm"
								bgColor="white"
								minW={240}
							/>
						) : (
							<Text
								border={'none'}
								p={1}
								fontSize={16}
								// focusBorderColor="none"
								onClick={() => {
									setIsEditingListName(true);
								}}
								minW={240}
							>
								{list.name}
							</Text>
						)}
					</Heading>
				</div>
				<IconButton
					aria-label="options"
					size="md"
					opacity={0.7}
					_hover={{ opacity: 1, backgroundColor: 'gray.200' }}
					variant="ghost"
					colorScheme="gray"
					icon={<DeleteIcon />}
					onClick={handleDeleteList}
				/>
			</Flex>
			<Stack
				direction={'column'}
				spacing={1}
				// p={2}
				maxH={'75.5vh'}
				position={'relative'}
				opacity={isDragging ? 0 : 1}
				overflowY={'auto'}
				css={{
					'&::-webkit-scrollbar': {
						width: '10px',
					},
					'&::-webkit-scrollbar-track': {
						width: '0px',
						border: 'solid 10px transparent',
					},
					'&::-webkit-scrollbar-thumb': {
						background: 'black',
						borderRadius: '16px',
						backgroundClip: 'content-box',
						border: 'solid 2px transparent',
					},
				}}
			>
				{/* {TODO: add more features to create task textarea} */}
				<SortableContext items={tasksId} strategy={verticalListSortingStrategy}>
					{list.tasks.map((task: KanbanTaskModel) => (
						<KanbanCard
							task={task}
							key={task.id}
							isDraggingList={isDraggingList}
							updateTask={updateTask}
							deleteTask={deleteTask}
						/>
					))}
					{/* {isCreatingNewTask && (
						<AutoResizeTextarea
							border={'none'}
							resize={'none'}
							// focusBorderColor="none"
							onFocus={(event: any) => {
								event.target.selectionEnd = event.target.value.length;
							}}
							onKeyDown={(event: any) => {
								if (event.key === 'Enter') {
									handleCreateTask(event);
								}
								if (event.key === 'Escape') {
								}
							}}
							autoFocus
							bgColor="white"
							minW={240}
							minH={100}
						/>
					)} */}
				</SortableContext>
			</Stack>
			<Box m={2}>
				<Button
					size="md"
					width="100%"
					minH={'50px'}
					justifyContent={'start'}
					leftIcon={<AddIcon />}
					variant="ghost"
					onClick={(e) => {
						setIsCreatingNewTask(true);
						handleCreateTask(e);
					}}
				>
					Add new task
				</Button>
			</Box>
		</Box>
	);
}
