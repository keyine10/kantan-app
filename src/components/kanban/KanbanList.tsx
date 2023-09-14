import { Box, Heading, Stack, Textarea } from '@chakra-ui/react';
import { KanbanListModel } from '../../types/kanban-list';
import KanbanCard from './KanbanCard';
import { KanbanTaskModel } from '../../types/kanban-task';

export default function KanbanList({ list }: { list: KanbanListModel }) {
	const renderTasks = list.tasks.map((task: KanbanTaskModel) => (
		<KanbanCard task={task} />
	));
	return (
		<Box h={'98vh'}>
			<Stack
				direction={'column'}
				spacing={4}
				mt={4}
				bgColor={'gray.50'}
				rounded={'lg'}
				boxShadow={'md'}
				overflow={'hidden'}
				p={4}
				h={'97%'}
				position={'relative'}
			>
				<Heading fontSize={'md'}>
					<Textarea
						value={list.name}
						border={'none'}
						p={0}
						color={'gray.700'}
						fontSize={16}
						resize={'none'}
						focusBorderColor="none"
					/>
				</Heading>
				{renderTasks}
			</Stack>
		</Box>
	);
}
