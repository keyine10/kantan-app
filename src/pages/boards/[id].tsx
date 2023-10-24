import { useRouter } from 'next/router';
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';
import useSWR from 'swr';
import { API_ENDPOINT_BOARDS, EVENTS } from '../../components/common/constants';
import { axiosHelper } from '../../services/fetcher';
import { Container, Spinner, ToastId, list, useToast } from '@chakra-ui/react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { io } from 'socket.io-client';
import { KanbanListModel } from '../../types/kanban-list';
import { AxiosError } from 'axios';
import { KanbanBoardModel } from '../../types/kanban-board';
import { getSocket, socket } from '../../services/socket';

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
		isValidating,
		isLoading,
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
	}, [isLoading]);
	useEffect(() => {
		socket.on(EVENTS.BOARD_UPDATED, (data) => {
			console.log('board-updated', data);
			mutate({
				...board,
				...data,
			});
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
						lists: [...board.lists, data.content],
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

		socket.on('task-created', (data) => {
			console.log('task-created', data);
		});

		socket.on('task-updated', (data) => {
			console.log('task-updated', data);
		});

		socket.on('task-deleted', (data) => {
			console.log(socket.id);
			console.log('task-deleted', data);
		});
	}, [isLoading]);

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
	return <KanbanBoard board={board} mutate={mutate} user={user} />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const id = context.query.id;
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
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
