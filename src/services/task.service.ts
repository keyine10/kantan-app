import axios from 'axios';
import {
	API_ENDPOINT_LISTS,
	API_ENDPOINT_TASKS,
} from '../components/common/constants';
import { API_URL } from './board.service';

export const taskService = {
	// getBoards,
	createTask,
	deleteTask,
	updateTask,
	addAttachment,
	removeAttachment,
};

// function getBoards(url: string, token: string) {
// 	return axios.get(process.env.NEXT_PUBLIC_API_URL + API_ENDPOINT_BOARDS, {
// 		headers: { Authorization: 'Bearer ' + token },
// 	});
// }

function createTask(data: any, token: string) {
	return axios
		.post(API_URL + API_ENDPOINT_TASKS, data, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}

function deleteTask(id: string, token: string) {
	return axios.delete(API_URL + API_ENDPOINT_TASKS + `/${id}`, {
		headers: { Authorization: 'Bearer ' + token },
	});
}

function updateTask(data: any, token: string) {
	return axios
		.patch(
			API_URL + API_ENDPOINT_TASKS + `/${data.id}`,
			{
				name: data.name,
				position: data.position,
				description: data.description,
				listId: data.listId,
				backgroundColor: data.backgroundColor,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data);
}

function addAttachment(taskId: any, attachment: any, token: string) {
	return axios
		.post(API_URL + API_ENDPOINT_TASKS + `/${taskId}/attachments`, attachment, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}
function removeAttachment(taskId: string, attachmentId: string, token: string) {
	return axios
		.delete(
			API_URL + API_ENDPOINT_TASKS + `/${taskId}/attachments/${attachmentId}`,
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data);
}
