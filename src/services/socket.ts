import { io } from 'socket.io-client';
export const websocketURL =
	process.env.NODE_ENV === 'development'
		? (process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT as string)
		: (process.env.NEXT_PUBLIC_API_URL as string);
export const getSocket = (user: any) =>
	io(websocketURL, {
		autoConnect: false,
		extraHeaders: {
			Authorization: 'Bearer ' + user.accessToken,
		},
	});
