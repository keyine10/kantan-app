import axios from 'axios';
import { API_ENDPOINT_BOARDS } from '../components/common/constants';
import { KanbanBoardModel } from '../types/kanban-board';

export const boardService = {
	// getBoards,
	createBoard,
	deleteBoard,
	updateBoard,
	addMember,
	removeMember,
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

function createBoard(data: Partial<KanbanBoardModel>, token: string) {
	return axios
		.post(API_URL + API_ENDPOINT_BOARDS, data, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data as KanbanBoardModel);
}

function updateBoard(data: Partial<KanbanBoardModel>, token: string) {
	return axios
		.patch(
			API_URL + API_ENDPOINT_BOARDS + `/${data.id}`,
			{
				title: data.title,
				description: data.description,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data as KanbanBoardModel);
}

function addMember(data: any, token: string) {
	return axios
		.post(
			API_URL + API_ENDPOINT_BOARDS + `/${data.id}` + '/members',
			{
				email: data.email,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data as KanbanBoardModel);
}

function removeMember(data: any, token: string) {
	return axios
		.delete(API_URL + API_ENDPOINT_BOARDS + `/${data.id}` + '/members', {
			headers: { Authorization: 'Bearer ' + token },
			data: {
				email: data.email,
			},
		})
		.then((res) => res.data as KanbanBoardModel);
}
function deleteBoard(id: string, token: string) {
	return axios
		.delete(API_URL + API_ENDPOINT_BOARDS + `/${id}`, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}
