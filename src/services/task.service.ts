import axios from 'axios';
import { API_ENDPOINT_TASKS } from '../components/common/constants';
import { API_URL } from './board.service';

export const taskService = {
	// getBoards,
	createTask,
	deleteTask,
	updateTask,
	addAttachment,
	removeAttachment,
	addTag,
	removeTag,
	updateTag,
};

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

function addAttachment(taskId: string, attachment: any, token: string) {
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

function addTag(taskId: string, tag: any, token: string) {
	return axios
		.post(API_URL + API_ENDPOINT_TASKS + `/${taskId}/tags`, tag, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}

function updateTag(taskId: string, tag: any, token: string) {
	return axios
		.patch(
			API_URL + API_ENDPOINT_TASKS + `/${taskId}/tags/${tag.id}`,
			{ name: tag.name, backgroundColor: tag.backgroundColor },
			{
				headers: { Authorization: 'Bearer ' + token },
			},
		)
		.then((res) => res.data);
}

function removeTag(taskId: string, tagId: string, token: string) {
	return axios
		.delete(API_URL + API_ENDPOINT_TASKS + `/${taskId}/tags/${tagId}`, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}
