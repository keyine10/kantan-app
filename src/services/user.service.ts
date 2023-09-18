import axios from 'axios';

export const userService = {
	signUp,
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
