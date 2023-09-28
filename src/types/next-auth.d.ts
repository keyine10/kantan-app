import NextAuth from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			accessToken: string;
		} & DefaultSession['user'];
	}
	interface User {
		id: number;
		name: string;
		email: string;
		bio: string;
		accessToken: string;
	}
}
