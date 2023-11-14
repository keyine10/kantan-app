import Head from 'next/head';
import LayoutWithNavBar from '../components/layout/LayoutWithNavBar';
import { ReactElement } from 'react';
import {
	Container,
	Divider,
	Heading,
	Spacer,
	Spinner,
	useToast,
} from '@chakra-ui/react';
import { getServerSession } from 'next-auth';
import { GetServerSidePropsContext } from 'next';
import { authOptions } from './api/auth/[...nextauth]';
import { signOut, useSession } from 'next-auth/react';
import useUser from '../hooks/useUser';
import { API_ENDPOINT_BOARDS } from '../components/common/constants';
import useSWR from 'swr';
import { axiosHelper } from '../services/fetcher';
import KanbanBoardListing from '../components/kanban/KanbanBoardListing';
import { boardService } from '../services/board.service';
import { KanbanBoardModel } from '../types/kanban-board';

export default function Home({ props }: any) {
	// const [boards, setBoards] = useState(mockboards);
	const { data: session, status } = useSession({ required: true });
	const toast = useToast();

	console.log(session);
	const { user, isLoading, isError } = useUser(
		session?.user?.id,
		session?.user?.accessToken,
	);
	// console.log(user);
	const {
		data: boards,
		error,
		mutate,
	} = useSWR(
		[API_ENDPOINT_BOARDS, session?.user?.accessToken],
		([API_ENDPOINT_BOARDS, token]) =>
			axiosHelper.getWithToken(API_ENDPOINT_BOARDS, token),
	);
	const createBoard = async ({
		title,
		description,
	}: {
		title: string;
		description: string;
	}) => {
		const newBoard = await boardService.createBoard(
			{
				title,
				description,
			},
			session?.user?.accessToken,
		);
		console.log('created board:', newBoard);
		setTimeout(() => {
			mutate(
				(boards: any) => {
					return [...boards, newBoard];
				},
				{
					revalidate: true,
					populateCache: true,
				},
			);
		}, 100);
	};
	const deleteBoard = async (id: string) => {
		try {
			await boardService.deleteBoard(id, session?.user?.accessToken);
			toast({
				status: 'success',
				title: 'Deleted board!',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
			mutate(boards.filter((board: KanbanBoardModel) => board.id !== id));
		} catch (e) {
			toast({
				status: 'error',
				title: 'Could not delete board, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	};

	if (isLoading)
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
	console.log(boards);
	return (
		<>
			<Head>
				<title>Kantan Dashboard</title>
				<meta name="description" content="Kantan homepage" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Container maxW="5xl" h={'90vh'}>
				<Heading>Welcome, {user?.name}</Heading>

				<Divider />
				<Spacer margin={5} />

				<KanbanBoardListing
					boards={boards}
					isLoading={isLoading}
					createBoard={createBoard}
					deleteBoard={deleteBoard}
					user={user}
					toast={toast}
				/>
			</Container>
		</>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, authOptions);
	// If the user is already logged in, redirect.
	// Note: Make sure not to redirect to the same page
	// To avoid an infinite loop!
	// console.log(session);
	if (Date.parse(session?.expires as string) < Date.now()) {
		signOut();
		return {
			redirect: {
				destination: '/signin',
				permanent: false,
			},
		};
	}
	//TODO: redirect
	if (!session) {
		return { redirect: { destination: '/signin' } };
	}

	return {
		props: { session: session },
	};
}

Home.getLayout = function getLayout(page: ReactElement) {
	return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
