import axios from 'axios';
import { API_ENDPOINT_BOARDS } from '../components/common/constants';

export const boardService = {
	// getBoards,
	createBoard,
	deleteBoard,
};

// function getBoards(url: string, token: string) {
// 	return axios.get(process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS, {
// 		headers: { Authorization: 'Bearer ' + token },
// 	});
// }

function createBoard(data: any, token: string) {
	return axios.post(
		process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS,
		data,
		{
			headers: { Authorization: 'Bearer ' + token },
		},
	);
}

function deleteBoard(id: string, token: string) {
	return axios.delete(
		process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS + `/${id}`,
		{
			headers: { Authorization: 'Bearer ' + token },
		},
	);
}
