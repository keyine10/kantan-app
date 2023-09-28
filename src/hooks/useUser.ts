import useSWR from 'swr';
import { userService } from '../services/user.service';

export default function useUser(id: string, token: string) {
	const { data, error, isLoading } = useSWR(
		[`/users/${id}`, token],
		([url, token]) => userService.getUser(url, token),
	);

	return {
		user: data,
		isLoading,
		isError: error,
	};
}
