import axios from 'axios';

export const userService = {
	signUp,
	getUser,
};

function signUp(name: string, email: string, password: string) {
	return axios.post(
		process.env.NEXT_PUBLIC_API_URL + '/authentication/sign-up',
		{
			name,
			email,
			password,
		},
	);
}

async function getUser(url: string, token: string) {
	return axios
		.get(process.env.NEXT_PUBLIC_API_URL + url, {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then((res) => res.data);
}
