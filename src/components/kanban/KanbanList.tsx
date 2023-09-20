import {
	Box,
	Heading,
	Stack,
	Text,
	Button,
	IconButton,
	Flex,
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
import { AddIcon, HamburgerIcon } from '@chakra-ui/icons';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';

export default function KanbanList({
	list,
	isDraggingList,
}: {
	list: KanbanListModel;
	isDraggingList: boolean;
}) {
	const [tasks, setTasks] = useState(list.tasks);
	const [isEditingListName, setIsEditingListName] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	let tasksId = useMemo(
		() => list.tasks.map((task: KanbanTaskModel) => task.id),
		[list.tasks],
	);

	const handleCreateTask = () => {
		console.log('Creating new task');
		let newTask: KanbanTaskModel = {
			id: Math.random().toString(36),
			name: 'new task #' + list.tasks.length,
			description: '',
			position: 0,
		};
		setTasks([...tasks, newTask]);
		list.tasks = [...list.tasks, newTask];
	};

	const handleRenameList = (event: any) => {
		setIsEditingListName(false);
		list.name = event.target.value;
	};

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
	return (
		<Box
			maxH={{ base: '98vh', xl: '99vh' }}
			rounded={'lg'}
			boxShadow={
				isDragging
					? 0
					: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;'
			}
			border={isDragging ? '2px dashed black' : 'none'}
			bgColor={'gray.50'}
			minWidth={'300px'}
			ref={setNodeRef}
			style={style}
			zIndex={100}
		>
			<Stack
				direction={'column'}
				spacing={4}
				p={2}
				maxH={'98%'}
				position={'relative'}
				opacity={isDragging ? 0 : 1}
			>
				<Flex direction="row">
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
						icon={<HamburgerIcon />}
					/>
				</Flex>
				<SortableContext items={tasksId} strategy={verticalListSortingStrategy}>
					{tasks.map((task: KanbanTaskModel) => (
						<KanbanCard
							task={task}
							key={task.id}
							isDraggingList={isDraggingList}
						/>
					))}
				</SortableContext>
				<Button
					size="md"
					width="100%"
					justifyContent={'start'}
					leftIcon={<AddIcon />}
					variant="ghost"
					onClick={handleCreateTask}
				>
					Add new task
				</Button>
			</Stack>
		</Box>
	);
}
