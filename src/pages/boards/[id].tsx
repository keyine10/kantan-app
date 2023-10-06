import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';
import useSWR from 'swr';
import { API_ENDPOINT_BOARDS } from '../../components/common/constants';
import { axiosHelper } from '../../services/fetcher';
import { Container, Spinner } from '@chakra-ui/react';
import {
	GetServerSideProps,
	GetServerSidePropsContext,
	InferGetServerSidePropsType,
} from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

const WebrtcProvider = require('y-webrtc').WebrtcProvider;

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
	} = useSWR(
		[API_ENDPOINT_BOARD, user.accessToken],
		([API_ENDPOINT_BOARD, token]) =>
			axiosHelper.getWithToken(API_ENDPOINT_BOARD, token),
	);
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
