import axios from 'axios';
import { API_URL } from './board.service';

export const axiosHelper = {
	get,
	getWithToken,
	postWithToken,
	patchWithToken,
	deleteWithToken,
};

function get(url: string) {
	return axios.get(API_URL + url).then((res) => res.data);
}

function getWithToken(url: string, token: string) {
	return axios
		.get(API_URL + url, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => {
			return res.data;
		});
}

function postWithToken(url: string, token: string, data: any) {
	return axios
		.post(API_URL + url, data, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}

function patchWithToken(url: string, token: string, data: any) {
	return axios
		.patch(API_URL + url, data, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}

function deleteWithToken(url: string, token: string) {
	return axios
		.delete(API_URL + url, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}
