import { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';
import useSWR from 'swr';
import { API_ENDPOINT_BOARDS, EVENTS } from '../../components/common/constants';
import { axiosHelper } from '../../services/fetcher';
import {
	Box,
	Container,
	Flex,
	Spinner,
	ToastId,
	list,
	useToast,
} from '@chakra-ui/react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { KanbanListModel } from '../../types/kanban-list';
import { KanbanBoardModel } from '../../types/kanban-board';
import { getSocket } from '../../services/socket';
import KanbanBoardBar from '@/components/kanban/KanbanBoardBar';
import Head from 'next/head';
import Navbar from '../../components/common/Navbar';

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
	const router = useRouter();

	const [activeMembers, setActiveMembers] = useState([]);

	useEffect(() => {
		if (error && error?.response.status === 401) {
			router.push('/');
		}
		if (error) router.push('/');
		const socket = getSocket(user);

		if (!socket.connected) {
			socket.connect();
		}
		socket.on('message', (data) => {
			console.log(data);
		});
		socket.on('authorized', (data) => {
			socket.emit('board-join', {
				id: id,
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
			router.push('/');
		});

		socket.on(EVENTS.BOARD_UPDATED, (data) => {
			console.log('board-updated', data);
			mutate(
				(board: KanbanBoardModel) => {
					return {
						...board,
						...data.content,
					};
				},
				{
					revalidate: true,
					populateCache: true,
				},
			);
		});

		socket.on(EVENTS.BOARD_DELETED, (data) => {
			console.log('board-deleted', data);
			router.push('/');
		});

		socket.on(EVENTS.BOARD_ACTIVE_MEMBERS, (data) => {
			console.log('board-active-members', data);
			if (!isLoading && data.members && data.pendingMembers)
				mutate(
					(board: any) => {
						return {
							...board,
							members: data.members,
							pendingMembers: data.pendingMembers,
						};
					},
					{
						revalidate: false,
						populateCache: true,
					},
				);
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
											.sort((a, b) => Number(a.position) - Number(b.position)),
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
									.sort((a, b) => Number(a.position) - Number(b.position));
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
		socket.on(EVENTS.BOARD_MEMBERS_UPDATED, (data) => {
			console.log('board-members-updated', data);
			mutate(
				(board: KanbanBoardModel) => {
					return {
						...board,
						members: data.members,
						pendingMembers: data.pendingMembers,
					};
				},
				{
					revalidate: false,
					populateCache: true,
				},
			);
			if (data.removedMember)
				console.log('removed member:', data.removedMember, user);
			if (Number(data.removedMember?.id) === Number(user.id)) router.push('/');
		});
		return () => {
			socket.disconnect();
		};
	}, []);

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
		// <LayoutWithNavBar
		// 	bgColor={board?.backgroundColor ? board?.backgroundColor : 'gray.200'}
		// >
		<>
			<Head>
				<title>{board?.title}</title>
				<meta name="description" content="Kantan Board Page" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Box
				bgColor={board?.backgroundColor ? board?.backgroundColor : 'gray.200'}
				overflowY={'hidden'}
				w="100vw"
				h="100vh"
			>
				<Navbar
					bgColor={board?.backgroundColor ? board?.backgroundColor : 'gray.200'}
				/>

				<KanbanBoardBar
					board={board}
					mutate={mutate}
					user={user}
					activeMembers={activeMembers}
				/>
				<KanbanBoard board={board} mutate={mutate} user={user} />
			</Box>
		</>
		// </LayoutWithNavBar>
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
// KanbanPage.getLayout = function getLayout(page: ReactElement) {
// 	return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
// };
