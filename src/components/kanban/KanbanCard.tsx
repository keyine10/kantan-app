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
	border,
} from '@chakra-ui/react';
import { KanbanTaskModel } from '../../types/kanban-task';
import { DeleteIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { useEffect, useRef, useState } from 'react';

interface KanbanCardProps {
	task: KanbanTaskModel;
	isDraggingList: boolean;
	isDragOverlay: boolean;
	updateTask: (id: string, updatedTask: KanbanTaskModel) => void;
	deleteTask: (id: string, listId: string) => void;
}
export default function KanbanCard({
	task,
	isDraggingList,
	updateTask,
	deleteTask,
	isDragOverlay = false,
}: KanbanCardProps) {
	let cardRef = useRef<HTMLButtonElement | null>(0);
	const [isEditingTaskName, setIsEditingTaskName] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
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
		transition: {
			duration: 0,
			easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
		},
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
				as="div"
				position="relative"
				rounded={'lg'}
				minW={240}
				maxW={284}
				mx={2}
				my={1}
				// maxH={500}
				zIndex={isDragging ? 100 : 10}
				bgColor={isDragging ? 'gray.400' : 'white'}
				role={'group'}
				border={'2px solid transparent'}
				_hover={
					isDragOverlay
						? { border: 'none' }
						: {
								border: '2px',
						  }
				}
				key={task.id}
				boxShadow={
					'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;'
				}
			>
				<CardBody px={2} py={1.5} opacity={isDragging ? 0 : 1}>
					{isEditingTaskName ? (
						<AutoResizeTextarea
							border={'none'}
							resize={'none'}
							defaultValue={task.name}
							// focusBorderColor="none"
							onBlur={handleRenameTask}
							maxLength={50}
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
					<Box>
						<Menu isLazy>
							<MenuButton
								disabled={isDragging || isEditingTaskName || isDragOverlay}
								display={
									isEditingTaskName || isDragging || isDragOverlay
										? 'none'
										: 'block'
								}
								opacity={0}
								role={'link'}
								_groupHover={{ opacity: 1 }}
								_peerHover={{ opacity: 1 }}
								as={IconButton}
								aria-label="Options"
								icon={<HamburgerIcon />}
								variant="outline"
								position={'absolute'}
								top={1}
								right={1}
								zIndex={100}
								size="sm"
								// opacity={1}
								background={'white'}
								_hover={{ opacity: 1, backgroundColor: 'gray.100' }}
								borderRadius={'100'}
								colorScheme="gray"
							/>
							<Portal appendToParentPortal={false}>
								<MenuList zIndex={1000} minWidth={10} px={2} className="peer">
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
					</Box>
				</CardBody>
			</Card>
		</Box>
	);
}
