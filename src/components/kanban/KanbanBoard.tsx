import { Container, HStack, Stack } from '@chakra-ui/react';
import KanbanList from './KanbanList';
import { KanbanListModel } from '../../types/kanban-list';

const mockBoard = {
	lists: [
		{
			id: 'aad7949d-fa6b-4e69-be61-32b1d998eab0',
			name: 'updated name for list',
			position: 1024,
			tasks: [
				{
					id: '1',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '3',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
		{
			id: '26d603cf-e160-4d1f-9325-5dd291498493',
			name: 'new list 2334',
			position: 8192,
			tasks: [
				{
					id: '1',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '3',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
		{
			id: 'f79e20fa-fea1-49a4-82ab-41c3fb98e899',
			name: 'new list 2334',
			position: 16384,
			tasks: [
				{
					id: '1',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '3',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
	],
};

export default function KanbanBoard() {
	const renderLists = mockBoard.lists.map((list: KanbanListModel) => (
		<KanbanList list={list} key={list.id} />
	));

	return (
		<Container maxW={'container.lg'} overflow={'auto'}>
			<HStack spacing={10}>{renderLists}</HStack>
		</Container>
	);
}
