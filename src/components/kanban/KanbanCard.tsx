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
import { HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { useRef, useState } from 'react';
export default function KanbanCard({
	task,
	isDraggingList,
}: {
	task: KanbanTaskModel;
	isDraggingList: boolean;
}) {
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
		disabled: isEditingTaskName,
	});

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};

	const handleRenameTask = (event: any) => {
		setIsEditingTaskName(false);
		task.name = event.target.value;
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
			{...attributes}
			{...listeners}
		>
			<Card
				opacity={isDragging ? 0 : 1}
				as="div"
				position="relative"
				rounded={'lg'}
				minW={240}
				maxW={304}
				maxH={500}
				bgColor={'white'}
				_hover={{
					backgroundColor: 'gray.100',
				}}
				onMouseEnter={() => {
					buttonRef.current!.style.display = 'block';
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
							autoFocus
							bgColor="white"
							minW={240}
						/>
					) : (
						<Text
							border={'none'}
							p={1}
							fontSize={16}
							// focusBorderColor="none"
							onClick={handleOnClickTask}
							minW={240}
							cursor={'pointer'}
						>
							{task.name}
						</Text>
					)}
					<IconButton
						display="none"
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
						icon={<HamburgerIcon />}
					/>
				</CardBody>
			</Card>
		</Box>
	);
}
