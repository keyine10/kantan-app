import {
	Box,
	IconButton,
	Textarea,
	Card,
	CardHeader,
	Text,
	CardBody,
} from '@chakra-ui/react';
import { KanbanTaskModel } from '../../types/kanban-task';
import { DeleteIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { useRef, useState } from 'react';

interface KanbanCardProps {
	task: KanbanTaskModel;
	isDraggingList: boolean;
	updateTask: (id: string, updatedTask: KanbanTaskModel) => void;
	deleteTask: (id: string) => void;
}
export default function KanbanCard({
	task,
	isDraggingList,
	updateTask,
	deleteTask,
}: KanbanCardProps) {
	let buttonRef = useRef<HTMLButtonElement | null>(null);
	const [isEditingTaskName, setIsEditingTaskName] = useState(false);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: 'task',
			task,
		},
		disabled: isEditingTaskName || isDraggingList,
	});

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};

	const handleRenameTask = (event: any) => {
		setIsEditingTaskName(false);
		updateTask(task.id, { ...task, name: event.target.value });
	};

	const handleDeleteTask = () => {
		deleteTask(task.id);
	};

	const handleOnClickTask = () => {
		setIsEditingTaskName(true);
	};

	return (
		<Box
			// opacity={isDragging ? 1 : 0}
			border={isDragging ? '2px dashed black' : 'none'}
			ref={isDraggingList ? undefined : setNodeRef}
			style={style}
		>
			<Card
				{...attributes}
				{...listeners}
				opacity={isDragging ? 0 : 1}
				as="div"
				position="relative"
				rounded={'lg'}
				minW={240}
				maxW={304}
				// maxH={500}
				zIndex={isDragging ? 100 : 10}
				bgColor={'white'}
				_hover={{
					backgroundColor: 'gray.100',
				}}
				onMouseEnter={() => {
					if (!isEditingTaskName && !isDragging)
						buttonRef.current!.style.display = 'block';
					else buttonRef.current!.style.display = 'none';
				}}
				onMouseLeave={() => {
					buttonRef.current!.style.display = 'none';
				}}
				key={task.id}
				boxShadow={
					'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;'
				}
			>
				<CardBody px={2} py={3}>
					{isEditingTaskName ? (
						<AutoResizeTextarea
							border={'none'}
							resize={'none'}
							defaultValue={task.name}
							// focusBorderColor="none"
							onBlur={handleRenameTask}
							onFocus={(event: any) => {
								event.target.selectionEnd = event.target.value.length;
							}}
							onKeyDown={(event: any) => {
								if (event.key === 'Enter') {
									handleRenameTask(event);
									setIsEditingTaskName(false);
								}
								if (event.key === 'Escape') {
									setIsEditingTaskName(false);
								}
							}}
							autoFocus
							bgColor="white"
							minW={240}
						/>
					) : (
						<Text
							border={'none'}
							p={1}
							fontSize={16}
							onClick={handleOnClickTask}
							minW={240}
							cursor={'pointer'}
							minH={'1.5em'}
						>
							{task.name}
						</Text>
					)}
					<IconButton
						display={'none'}
						ref={buttonRef}
						position={'absolute'}
						aria-label="options"
						top={1}
						right={1}
						zIndex={100}
						size="md"
						opacity={0.3}
						_hover={{ opacity: 1, backgroundColor: 'gray.200' }}
						variant="ghost"
						colorScheme="gray"
						_groupHover={{
							opacity: 0.25,
						}}
						onClick={handleDeleteTask}
						icon={<DeleteIcon />}
					/>
				</CardBody>
			</Card>
		</Box>
	);
}
