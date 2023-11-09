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
	Image,
	useDisclosure,
} from '@chakra-ui/react';
import { KanbanTaskModel } from '../../types/kanban-task';
import { DeleteIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { useEffect, useRef, useState } from 'react';
import { KanbanCardModal } from './KanbanCardModal';
import { useSession } from 'next-auth/react';

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
	const [isEditingTaskName, setIsEditingTaskName] = useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();
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
		disabled: isEditingTaskName || isDraggingList || isOpen,
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

	const handleOnClickEditTask = (event: any) => {
		event.stopPropagation();
		setIsEditingTaskName(true);
	};

	return (
		<Box
			// opacity={isDragging ? 1 : 0}
			ref={isDraggingList ? undefined : setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			_active={{ border: 'none' }}
		>
			<Card
				as="div"
				position="relative"
				rounded={'lg'}
				minW={240}
				maxW={284}
				mx={2}
				my={2}
				// maxH={500}
				zIndex={isDragging ? 100 : 10}
				bgColor={isDragging ? 'gray.400' : 'white'}
				role={'group'}
				// border={'2px solid transparent'}
				_hover={
					isDragOverlay
						? { border: 'none' }
						: {
								// border: '2px',
								// backgroundColor: 'gray.100',
								boxShadow: 'inset 0px 0px 0px 2px #070707',
						  }
				}
				key={task.id}
				onClick={onOpen}
				variant={'elevated'}
			>
				<CardHeader p={0}>
					{task.backgroundColor && (
						<Box
							height={'40px'}
							backgroundColor={task.backgroundColor}
							roundedTop={'lg'}
							opacity={isDragging ? 0 : 0.8}
						/>
					)}
				</CardHeader>
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
							{({ isOpen }) => (
								<>
									<MenuButton
										disabled={isDragging || isEditingTaskName || isDragOverlay}
										isActive={isOpen}
										opacity={isOpen ? 0.8 : 0}
										role={'link'}
										_groupHover={{ opacity: 0.8 }}
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
										onClick={(event) => {
											event.stopPropagation();
										}}
									/>
									<Portal appendToParentPortal={false}>
										<MenuList zIndex={1000} minWidth={10} px={2}>
											<MenuItem icon={<EditIcon />} onClick={onOpen}>
												Open Task...
											</MenuItem>
											<MenuItem
												onClick={handleOnClickEditTask}
												icon={<EditIcon />}
											>
												Edit Task Name
											</MenuItem>
											<MenuItem
												onClick={handleDeleteTask}
												icon={<DeleteIcon />}
											>
												Delete Task
											</MenuItem>
										</MenuList>
									</Portal>
								</>
							)}
						</Menu>
						<KanbanCardModal
							isOpen={isOpen}
							onClose={onClose}
							task={task}
							updateTask={updateTask}
						/>
					</Box>
				</CardBody>
			</Card>
		</Box>
	);
}
