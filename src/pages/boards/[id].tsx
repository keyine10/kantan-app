import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';
import useSWR from 'swr';
import { API_ENDPOINT_BOARDS } from '../../components/common/constants';
import { axiosHelper } from '../../services/fetcher';
import { Container, Spinner, useToast } from '@chakra-ui/react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { io } from 'socket.io-client';

export default function KanbanPage({
	user,
	id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	// console.log(id);
	// console.log('session on client', user);
	const websocketURL =
		process.env.NODE_ENV === 'development'
			? (process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT as string)
			: (process.env.NEXT_PUBLIC_API_URL as string);
	const API_ENDPOINT_BOARD = API_ENDPOINT_BOARDS + '/' + id;
	const {
		data: board,
		error,
		mutate,
	} = useSWR(
		[API_ENDPOINT_BOARD, user.accessToken],
		([API_ENDPOINT_BOARD, token]) =>
			axiosHelper.getWithToken(API_ENDPOINT_BOARD, token),
	);
	const toast = useToast();

	useEffect(() => {
		const socket = io(websocketURL, {
			extraHeaders: {
				Authorization: 'Bearer ' + user.accessToken,
			},
		});

		socket.on('connect', () => {
			if (socket.recovered) {
				toast({
					title: 'Reconnnected to Websocket Server!',
					status: 'info',
					isClosable: true,
					duration: 5000,
				});
			}
		});
		// socket.on('disconnect', () => {
		// 	console.log('disconnected from websocket');
		// });
		socket.on('message', (data) => {
			console.log(data);
		});
		socket.on('authorized', (data) => {
			socket.emit('board-join', {
				id: id,
			});
			mutate();
		});
		socket.on('disconnect', (data) => {
			toast({
				title: 'Disconnected from Websocket Server',
				description: 'Attempting to reconnect...',
				status: 'warning',
				isClosable: true,
				duration: 5000,
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

		socket.on('board-updated', (data) => {
			console.log('board-updated', data);
		});

		socket.on('board-deleted', (data) => {
			console.log('board-deleted', data);
		});

		socket.on('board-active-members', (data) => {
			console.log('board-active-members', data);
		});

		socket.on('list-created', (data) => {
			console.log('list-created', data);
		});

		socket.on('list-updated', (data) => {
			console.log('list-updated', data);
		});

		socket.on('list-deleted', (data) => {
			console.log('list-deleted', data);
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
