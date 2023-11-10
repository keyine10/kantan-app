import axios from 'axios';
import { API_ENDPOINT_LISTS } from '../components/common/constants';
import { API_URL } from './board.service';

export const listService = {
	// getBoards,
	createList,
	deleteList,
	updateList,
};

// function getBoards(url: string, token: string) {
// 	return axios.get(process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS, {
// 		headers: { Authorization: 'Bearer ' + token },
// 	});
// }

function createList(data: any, token: string) {
	return axios
		.post(API_URL + API_ENDPOINT_LISTS, data, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}

function deleteList(id: string, token: string) {
	return axios.delete(API_URL + API_ENDPOINT_LISTS + `/${id}`, {
		headers: { Authorization: 'Bearer ' + token },
	});
}

function updateList(data: any, token: string) {
	return axios
		.patch(
			API_URL + API_ENDPOINT_LISTS + `/${data.id}`,
			{
				name: data.name,
				position: data.position,
				backgroundColor: data.backgroundColor,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data);
}
