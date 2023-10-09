import axios from 'axios';
import {
	API_ENDPOINT_LISTS,
	API_ENDPOINT_TASKS,
} from '../components/common/constants';

export const taskService = {
	// getBoards,
	createTask,
	deleteTask,
	updateTask,
};

// function getBoards(url: string, token: string) {
// 	return axios.get(process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS, {
// 		headers: { Authorization: 'Bearer ' + token },
// 	});
// }

function createTask(data: any, token: string) {
	return axios
		.post(process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_TASKS, data, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}

function deleteTask(id: string, token: string) {
	return axios.delete(
		process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_TASKS + `/${id}`,
		{
			headers: { Authorization: 'Bearer ' + token },
		},
	);
}

function updateTask(data: any, token: string) {
	return axios
		.patch(
			process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_TASKS + `/${data.id}`,
			{
				name: data.name,
				position: data.position,
				description: data.description,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data);
}
