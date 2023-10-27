import { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';
import useSWR from 'swr';
import { API_ENDPOINT_BOARDS, EVENTS } from '../../components/common/constants';
import { axiosHelper } from '../../services/fetcher';
import { Container, Spinner, ToastId, list, useToast } from '@chakra-ui/react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { KanbanListModel } from '../../types/kanban-list';
import { KanbanBoardModel } from '../../types/kanban-board';
import { getSocket } from '../../services/socket';
import { taskService } from '../../services/task.service';
import KanbanBoardBar from '../../components/kanban/KanbanBoardBar';

export default function KanbanPage({
	user,
	id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	// console.log(id);
	// console.log('session on client', user);

	const API_ENDPOINT_BOARD = API_ENDPOINT_BOARDS + '/' + id;
	const {
		data: board,
		error,
		mutate,
		isLoading,
	}: {
		data: KanbanBoardModel;
		error: any;
		mutate: any;
		isLoading: boolean;
	} = useSWR(
		[API_ENDPOINT_BOARD, user.accessToken],
		([API_ENDPOINT_BOARD, token]) =>
			axiosHelper.getWithToken(API_ENDPOINT_BOARD, token),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			revalidateIfStale: false,
			populateCache: true,
		},
	);
	const toast = useToast();
	const toastIdRef = useRef<ToastId>();
	const socket = getSocket(user);
	const router = useRouter();

	const [activeMembers, setActiveMembers] = useState([]);

	useEffect(() => {
		if (!socket.connected && !isLoading) {
			socket.connect();
		}
		socket.on('message', (data) => {
			console.log(data);
		});
		socket.on('authorized', (data) => {
			socket.emit('board-join', {
				id: board.id,
			});
			if (toastIdRef.current)
				toast.update(toastIdRef.current, {
					title: 'Successfully reconnected to Websocket Server',
					status: 'success',
					duration: 2000,
					isClosable: true,
					position: 'bottom-left',
				});
			console.log('connected', socket.id);
		});

		socket.on('disconnect', (data) => {
			if (router.pathname !== `/boards/${id}`) {
				return;
			}
			toastIdRef.current = toast({
				title: 'Disconnected from Websocket Server',
				status: 'warning',
				isClosable: true,
				duration: 5000,
				position: 'bottom-left',
			});
		});
		socket.on('error', (data) => {
			console.log('error:', data);
			toast({
				title: 'Error from Websocket Server',
				description: data,
				status: 'error',
				duration: 9000,
				isClosable: true,
				position: 'bottom-left',
			});
		});
		return () => {
			socket.disconnect();
		};
	}, [isLoading, socket, toast, board.id, id, router.pathname]);
	useEffect(() => {
		socket.on(EVENTS.BOARD_UPDATED, (data) => {
			console.log('board-updated', data);
			mutate();
		});

		socket.on(EVENTS.BOARD_DELETED, (data) => {
			console.log('board-deleted', data);
		});

		socket.on(EVENTS.BOARD_ACTIVE_MEMBERS, (data) => {
			console.log('board-active-members', data);
			setActiveMembers(data.activeMembers);
		});

		socket.on(EVENTS.LIST_CREATED, (data) => {
			console.log('list-created', data);
			mutate(
				(board: any) => {
					return {
						...board,
						lists: board.lists
							.filter((list: any) => list.id !== data.content.id)
							.concat(data.content),
					};
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
		});

		socket.on(EVENTS.LIST_UPDATED, (data) => {
			console.log('list-updated', data);
			mutate(
				(board: KanbanBoardModel) => {
					let newLists = board.lists.map((list: any) =>
						list.id === data.content.id
							? {
									...list,
									...data.content,
							  }
							: list,
					);
					if (data.content.position !== data._old.position)
						newLists.sort((a: any, b: any) => a.position - b.position);
					return {
						...board,
						lists: newLists,
					};
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
		});

		socket.on(EVENTS.LIST_DELETED, (data) => {
			console.log('list-deleted', data);
			mutate(
				(board: any) => {
					return {
						...board,
						lists: board.lists.filter(
							(list: any) => list.id !== data.content.id,
						),
					};
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
		});

		socket.on(EVENTS.TASK_CREATED, (data) => {
			console.log('task-created', data);
			const task = data.content;
			mutate(
				(board: KanbanBoardModel) => {
					return {
						...board,
						lists: board.lists.map((list: KanbanListModel) =>
							list.id === task.listId
								? {
										...list,
										tasks: list.tasks
											.filter((t) => t.id !== task.id)
											.concat(task),
								  }
								: list,
						),
					};
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
		});

		socket.on(EVENTS.TASK_DELETED, (data) => {
			console.log('task-deleted', data);
			const task = data.content;
			mutate(
				(board: KanbanBoardModel) => {
					return {
						...board,
						lists: board.lists.map((list: KanbanListModel) =>
							list.id === task.listId
								? {
										...list,
										tasks: list.tasks.filter((t) => t.id !== task.id),
								  }
								: list,
						),
					};
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
		});

		socket.on(EVENTS.TASK_UPDATED, (data) => {
			console.log('task-updated', data);
			const updatedTask = data.content;
			const oldTask = data._old;
			mutate(
				(board: KanbanBoardModel) => {
					if (updatedTask.listId === oldTask.listId) {
						let newLists = board.lists.map((list: KanbanListModel) =>
							list.id === updatedTask.listId
								? {
										...list,
										tasks: list.tasks
											.map((task) =>
												task.id === updatedTask.id ? updatedTask : task,
											)
											.sort((a, b) => a.position - b.position),
								  }
								: list,
						);

						return {
							...board,
							lists: newLists,
						};
					} else {
						let newLists = board.lists.map((list) => {
							if (list.id === oldTask.listId) {
								return {
									...list,
									tasks: list.tasks.filter((task) => task.id !== oldTask.id),
								};
							}
							if (list.id === updatedTask.listId) {
								let newTasks = list.tasks
									.filter((task) => task.id !== oldTask.id)
									.concat(updatedTask)
									.sort((a, b) => a.position - b.position);
								return {
									...list,
									tasks: newTasks,
								};
							}
							return list;
						});
						return {
							...board,
							lists: newLists,
						};
					}
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
		});
	}, [isLoading, mutate, socket]);

	if (!board)
		return (
			<Container
				h="91vh"
				m="0 auto"
				display={'flex'}
				alignItems={'center'}
				justifyContent={'center'}
			>
				<Spinner
					size="xl"
					thickness="4px"
					speed="0.65s"
					emptyColor="gray.200"
					color="blue.500"
				/>
			</Container>
		);
	return (
		<div>
			<KanbanBoardBar
				board={board}
				mutate={mutate}
				user={user}
				activeMembers={activeMembers}
			/>
			<KanbanBoard board={board} mutate={mutate} user={user} />
		</div>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const id = context.query.id;
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session || !session?.user) {
		return {
			redirect: {
				destination: '/signin',
				permanent: false,
			},
		};
	}

	const { user } = session;
	return { props: { id, user } };
}
KanbanPage.getLayout = function getLayout(page: ReactElement) {
	return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
