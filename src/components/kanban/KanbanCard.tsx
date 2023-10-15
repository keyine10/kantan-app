import {
	Box,
	IconButton,
	Textarea,
	Card,
	CardHeader,
	Text,
	CardBody,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Portal,
	CardFooter,
} from '@chakra-ui/react';
import { KanbanTaskModel } from '../../types/kanban-task';
import { DeleteIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { useRef, useState } from 'react';

interface KanbanCardProps {
	task: KanbanTaskModel;
	isDraggingList: boolean;
	updateTask: (id: string, updatedTask: KanbanTaskModel) => void;
	deleteTask: (id: string, listId: string) => void;
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

	//TODO: make transition instant
	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};

	const handleRenameTask = (event: any) => {
		setIsEditingTaskName(false);
		updateTask(task.id, { ...task, name: event.target.value });
	};

	const handleDeleteTask = () => {
		deleteTask(task.id, task.listId);
	};

	const handleOnClickTask = () => {
		setIsEditingTaskName(true);
	};

	return (
		<Box
			// opacity={isDragging ? 1 : 0}
			ref={isDraggingList ? undefined : setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
		>
			<Card
				opacity={isDragging ? 0.5 : 1}
				as="div"
				position="relative"
				rounded={'lg'}
				minW={240}
				maxW={284}
				mx={2}
				my={1}
				// maxH={500}
				zIndex={isDragging ? 100 : 10}
				bgColor={'white'}
				// onMouseEnter={() => {
				// 	if (!isEditingTaskName && !isDragging)
				// 		buttonRef.current!.style.display = 'block';
				// 	else buttonRef.current!.style.display = 'none';
				// }}
				// onMouseLeave={() => {
				// 	buttonRef.current!.style.display = 'none';
				// }}
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
							// onClick={handleOnClickTask}
							minW={240}
							cursor={'pointer'}
							minH={'1.5em'}
						>
							{task.name}
						</Text>
					)}
					<Menu isLazy>
						<MenuButton
							disabled={isDragging || isEditingTaskName}
							display={isEditingTaskName ? 'none' : 'block'}
							as={IconButton}
							aria-label="Options"
							icon={<HamburgerIcon />}
							variant="outline"
							position={'absolute'}
							top={1}
							right={1}
							zIndex={100}
							size="md"
							opacity={0.3}
							_hover={{ opacity: 1, backgroundColor: 'gray.200' }}
							colorScheme="gray"
						/>
						<Portal appendToParentPortal={false}>
							<MenuList zIndex={1000} minWidth={10} px={2}>
								<MenuItem icon={<EditIcon />}>Open Task...</MenuItem>
								<MenuItem onClick={handleOnClickTask} icon={<EditIcon />}>
									Edit Task Name
								</MenuItem>
								<MenuItem onClick={handleDeleteTask} icon={<DeleteIcon />}>
									Delete Task
								</MenuItem>
							</MenuList>
						</Portal>
					</Menu>
				</CardBody>
			</Card>
		</Box>
	);
}
