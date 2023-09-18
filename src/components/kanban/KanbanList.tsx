import { Box, Heading, Stack, Textarea } from '@chakra-ui/react';
import { KanbanListModel } from '../../types/kanban-list';
import KanbanCard from './KanbanCard';
import { KanbanTaskModel } from '../../types/kanban-task';
import { useState } from 'react';
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
	rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { DndContext } from '@dnd-kit/core';

export default function KanbanList({ list }: { list: KanbanListModel }) {
	const [items, setItems] = useState(list.tasks);

	let taskIds = list.tasks.map((task: KanbanTaskModel) => task.id);

	const renderTasks = list.tasks.map((task: KanbanTaskModel) => (
		<KanbanCard task={task} key={task.id} />
	));
	return (
		<Box maxH={{ base: '98vh', xl: '99vh' }} bgColor={'gray.50'} rounded={'lg'}>
			<Stack
				direction={'column'}
				spacing={4}
				mt={4}
				p={4}
				maxH={'98%'}
				position={'relative'}
			>
				<Heading fontSize={'md'}>
					<Textarea
						defaultValue={list.name}
						border={'none'}
						p={0}
						fontSize={16}
						resize={'none'}
						focusBorderColor="none"
					/>
				</Heading>
				<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
					{renderTasks}
				</SortableContext>
			</Stack>
		</Box>
	);
}
