import useSWR from 'swr';
import { axiosHelper } from '../services/fetcher';
import { listService } from '../services/list.service';
import { useToast } from '@chakra-ui/react';

export default function useKantanBoard(API_ENDPOINT_BOARD: string, user: any) {
	const {
		data: board,
		error,
		mutate,
	} = useSWR(
		[API_ENDPOINT_BOARD, user.accessToken],
		([API_ENDPOINT_BOARD, token]) =>
			axiosHelper.getWithToken(API_ENDPOINT_BOARD, token),
	);

	return {
		board,
		error,
		mutate,
	};
}
