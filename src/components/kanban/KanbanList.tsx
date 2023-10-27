import {
	Box,
	Heading,
	Stack,
	Text,
	Button,
	IconButton,
	Flex,
	Textarea,
	useToast,
} from '@chakra-ui/react';
import { KanbanListModel } from '../../types/kanban-list';
import KanbanCard from './KanbanCard';
import { KanbanTaskModel } from '../../types/kanban-task';
import { useMemo, useRef, useState } from 'react';
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddIcon, HamburgerIcon, DeleteIcon } from '@chakra-ui/icons';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { POSITION_INTERVAL } from '../common/constants';
import CreateTaskBox from './CreateTaskBox';

interface KanbanListProps {
	list: KanbanListModel;
	isDraggingList: boolean;
	tasks: KanbanTaskModel[];
	isDraggingTask: boolean;

	createTask: (name: string, listId: string, position: number) => void;
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
		transition: {
			duration: 0,
			easing: 'cubic-bezier(0,0,0,0)',
		},
		disabled: isDraggingTask && list.tasks.length > 0,
	});

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};
	const toast = useToast();
	//usememo might make cards not re-render when moving around
	let tasksId = useMemo(
		() => list.tasks.map((task: KanbanTaskModel) => task.id),
		[list.tasks.length, isDraggingTask],
	);
	// let tasksId = list.tasks.map((task: KanbanTaskModel) => task.id);

	//sorting tasks will cause a re-render when moving lists around, only employ sorted tasks when the position of the tasks are correct, otherwise it will seem incorrect

	// let sortedTasks = useMemo(
	// 	() =>
	// 		list.tasks.sort(
	// 			(a: KanbanTaskModel, b: KanbanTaskModel) => a.position - b.position,
	// 		),
	// 	[list.tasks],
	// );

	const handleCreateTask = (event: any) => {
		event.stopPropagation();
		setIsCreatingNewTask(false);
		if (list.id.includes('temporary')) {
			toast({
				title: 'List is being created, please try again later',
				status: 'info',
				duration: 5000,
				isClosable: true,
				position: 'bottom-left',
			});
			return;
		}
		if (event.target.value.length <= 0) return;
		let position =
			list.tasks.length > 0
				? list.tasks[list.tasks.length - 1].position + POSITION_INTERVAL
				: POSITION_INTERVAL;

		createTask(event.target.value, list.id, position);
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
			maxH={{ base: '88vh', xl: '88vh' }}
			rounded={'lg'}
			boxShadow={
				isDragging
					? 0
					: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;'
			}
			// border={isDragging ? '2px dashed black' : 'none'}
			bgColor={isDragging ? 'gray.400' : 'gray.50'}
			minWidth={'284px'}
			maxWidth={'284px'}
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
								minW={224}
								maxLength={50}
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
								text-overflow="ellipsis"
								minW={224}
								maxW={224}
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
				maxH={'71vh'}
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
							isDragOverlay={false}
							updateTask={updateTask}
							deleteTask={deleteTask}
						/>
					))}
				</SortableContext>
			</Stack>
			<Box m={2}>
				{!isCreatingNewTask ? (
					<Button
						size="md"
						width="100%"
						minH={'50px'}
						justifyContent={'start'}
						leftIcon={<AddIcon />}
						variant="ghost"
						onClick={(e) => {
							setIsCreatingNewTask(true);
						}}
						opacity={isDragging ? 0 : 1}
					>
						Add new task
					</Button>
				) : (
					<CreateTaskBox
						handleCreateTask={handleCreateTask}
						setIsCreatingNewTask={setIsCreatingNewTask}
					/>
				)}
			</Box>
		</Box>
	);
}
