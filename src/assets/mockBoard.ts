export const mockBoard = {
	lists: [
		{
			id: 'A',
			name: 'updated name for list',
			position: 1024,
			tasks: [
				{
					id: '1',
					listId: 'A',
					name: 'very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long ',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '2',
					listId: 'A',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
			],
		},
		{
			id: 'B',
			name: 'new list 2334',
			position: 16384,
			tasks: [
				{
					id: '7',
					listId: 'B',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '8',
					listId: 'B',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
			],
		},
		{
			id: 'C',
			name: 'new list 2334',
			position: 8192,
			tasks: [
				{
					id: '4',
					listId: 'C',
					name: 'new task',
					description: 'new task description 1',
					position: 1,
				},
				{
					id: '5',
					listId: 'C',
					name: 'new task 1',
					description: 'new task description 2',
					position: 2,
				},
				{
					id: '6',
					listId: 'C',
					name: 'new task 2',
					description: 'new task description 3',
					position: 3,
				},
			],
		},
	],
};
