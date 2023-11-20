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
	Tooltip,
	HStack,
	Tag,
	TagLabel,
	WrapItem,
	Wrap,
} from '@chakra-ui/react';
import { KanbanTaskModel } from '../../types/kanban-task';
import { DeleteIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { useEffect, useRef, useState } from 'react';
import { KanbanCardModal } from './KanbanCardModal';
import { useSession } from 'next-auth/react';
import { ConfirmModalWrapper } from '../common/ConfirmModalWrapper';
import { Fa0, FaAlignLeft, FaPaperclip } from 'react-icons/fa6';
import tinycolor from 'tinycolor2';

interface KanbanCardProps {
	task: KanbanTaskModel;
	isDraggingList: boolean;
	isDragOverlay: boolean;
	updateTask: (id: string, updatedTask: KanbanTaskModel) => void;
	deleteTask: (id: string, listId: string) => void;
}

const getPublicURL = (path: string) => {
	return `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/attachment/${path}`;
};
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
		disabled: isEditingTaskName || isDraggingList || isOpen || isDragOverlay,
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
			role={'group'}
			__css={{
				touchAction: 'none',
			}}
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
				cursor={'pointer'}
				ref={isDraggingList ? undefined : setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
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
					{task.backgroundAttachmentPath && (
						<Box
							h={'80px'}
							maxH={'80px'}
							backgroundColor={'gray.100'}
							roundedTop={'lg'}
							opacity={isDragging ? 0 : 0.8}
						>
							<Image
								objectFit="cover"
								src={getPublicURL(task.backgroundAttachmentPath)}
								alt={'background'}
								maxH={'80px'}
								h={'80px'}
								width={'100%'}
								borderTopRadius={'8px'}
							/>
						</Box>
					)}
				</CardHeader>
				<CardBody px={2} py={1.5} opacity={isDragging ? 0 : 1}>
					<Wrap>
						{task.tags.map((tag: any) => (
							<WrapItem key={tag.id}>
								<Tag
									size={'sm'}
									key={tag.id}
									variant="solid"
									backgroundColor={tag.backgroundColor}
									color={
										tinycolor(tag.backgroundColor).getLuminance() < 0.5
											? 'white'
											: 'black'
									}
								>
									<TagLabel>{tag.name}</TagLabel>
								</Tag>
							</WrapItem>
						))}
					</Wrap>
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
							my="2"
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
							userSelect={'none'}
							unselectable="on"
						>
							{task.name}
						</Text>
					)}
					{!isDragOverlay && (
						<Box>
							<Menu isLazy>
								{({ isOpen }) => (
									<>
										<MenuButton
											disabled={
												isDragging || isEditingTaskName || isDragOverlay
											}
											isActive={isOpen}
											opacity={isOpen ? 0.8 : 0}
											role={'link'}
											_groupHover={{ opacity: 0.8 }}
											as={IconButton}
											aria-label="Options"
											icon={<HamburgerIcon />}
											variant="ghost"
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
													icon={<DeleteIcon />}
													onClick={handleDeleteTask}
												>
													Delete Task
												</MenuItem>
											</MenuList>
										</Portal>
									</>
								)}
							</Menu>
							{task && (
								<KanbanCardModal
									isOpen={isOpen}
									onClose={onClose}
									task={task}
									updateTask={updateTask}
									handleDeleteTask={handleDeleteTask}
								/>
							)}
						</Box>
					)}
				</CardBody>
				<CardFooter p={0} opacity={isDragging ? 0 : 1}>
					<HStack spacing={2}>
						{task?.description && (
							<Box ml={3} my={2}>
								<Tooltip
									label="Task has description"
									aria-label="Description tooltip"
									my={1}
								>
									<span>
										<FaAlignLeft mx={3} mb={3} mt={1} fontSize={'0.8rem'} />
									</span>
								</Tooltip>
							</Box>
						)}
						{task?.attachments?.length > 0 && (
							<Box ml={3} my={2}>
								<Tooltip
									label="Task has attachments"
									aria-label="Attachments tooltip"
									my={1}
								>
									<span>
										<FaPaperclip fontSize={'0.8rem'} />
									</span>
								</Tooltip>
							</Box>
						)}
					</HStack>
				</CardFooter>
			</Card>
		</Box>
	);
}
