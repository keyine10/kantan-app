import axios from 'axios';

export const axiosHelper = {
	get,
	getWithToken,
	postWithToken,
	patchWithToken,
	deleteWithToken,
};

function get(url: string) {
	return axios
		.get(process.env.NEXT_PUBLIC_API_URL + url)
		.then((res) => res.data);
}

function getWithToken(url: string, token: string) {
	return axios
		.get(process.env.NEXT_PUBLIC_API_URL + url, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}

function postWithToken(url: string, token: string, data: any) {
	return axios
		.post(process.env.NEXT_PUBLIC_API_URL + url, data, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}

function patchWithToken(url: string, token: string, data: any) {
	return axios
		.patch(process.env.NEXT_PUBLIC_API_URL + url, data, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}

function deleteWithToken(url: string, token: string) {
	return axios
		.delete(process.env.NEXT_PUBLIC_API_URL + url, {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		})
		.then((res) => res.data);
}
