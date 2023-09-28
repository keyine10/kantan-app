import Head from 'next/head';
import LayoutWithNavBar from '../components/layout/LayoutWithNavBar';
import { ReactElement, useState } from 'react';
import {
	Box,
	Button,
	Container,
	Divider,
	Heading,
	Popover,
	PopoverTrigger,
	Spacer,
	Stack,
	Wrap,
	WrapItem,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { getServerSession } from 'next-auth';
import { GetServerSidePropsContext } from 'next';
import { authOptions } from './api/auth/[...nextauth]';
import { useSession } from 'next-auth/react';
import useUser from '../hooks/useUser';
import { API_ENDPOINT_BOARDS } from '../components/common/constants';
import useSWR from 'swr';
import { axiosHelper } from '../services/fetcher';
import KanbanBoardListing from '../components/kanban/KanbanBoardListing';
import { boardService } from '../services/board.service';

const mockboards = [
	{ name: 'Board 1', id: '1' },
	{ name: 'Board 2', id: '2' },
	{ name: 'Board 3', id: '3' },
];

export default function Home({ props }: any) {
	// const [boards, setBoards] = useState(mockboards);
	const { data: session, status } = useSession({ required: true });
	console.log(session);
	const { user, isLoading, isError } = useUser(
		session?.user?.id,
		session?.user?.accessToken,
	);
	console.log(user);
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
		mutate([...boards, newBoard]);
	};
	const deleteBoard = () => {};

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
					mutate={mutate}
					createBoard={createBoard}
					deleteBoard={deleteBoard}
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
	console.log(session);
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
