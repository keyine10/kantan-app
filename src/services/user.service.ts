import axios from 'axios';
import { API_URL } from './board.service';

export const userService = {
	signUp,
	getUser,
};

function signUp(name: string, email: string, password: string) {
	return axios.post(API_URL + '/authentication/sign-up', {
		name,
		email,
		password,
	});
}

async function getUser(url: string, token: string) {
	return axios
		.get(API_URL + url, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}
