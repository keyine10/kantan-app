import axios from 'axios';
import { API_ENDPOINT_BOARDS } from '../components/common/constants';

export const boardService = {
	// getBoards,
	createBoard,
	deleteBoard,
};

export const API_URL =
	process.env.NODE_ENV === 'development'
		? process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT
		: process.env.NEXT_PUBLIC_API_URL;

// function getBoards(url: string, token: string) {
// 	return axios.get(process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS, {
// 		headers: { Authorization: 'Bearer ' + token },
// 	});
// }

function createBoard(data: any, token: string) {
	return axios.post(API_URL + API_ENDPOINT_BOARDS, data, {
		headers: { Authorization: 'Bearer ' + token },
	});
}

function deleteBoard(id: string, token: string) {
	return axios.delete(API_URL + API_ENDPOINT_BOARDS + `/${id}`, {
		headers: { Authorization: 'Bearer ' + token },
	});
}
