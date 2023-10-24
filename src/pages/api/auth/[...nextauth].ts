import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const KANTAN_BACKEND_SIGNIN_ENDPOINT =
	process.env.NODE_ENV === 'development'
		? process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT + '/authentication/sign-in'
		: process.env.NEXT_PUBLIC_API_URL + '/authentication/sign-in';

export const authOptions: NextAuthOptions = {
	secret: process.env.JWT_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 3600,
	},
	providers: [
		CredentialsProvider({
			id: 'credentials',
			name: 'Credentials',
			type: 'credentials',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
					placeholder: 'jsmith@gmail.com',
				},
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				// Add logic here to look up the user from the credentials supplied
				try {
					const response = await axios.post(KANTAN_BACKEND_SIGNIN_ENDPOINT, {
						email: credentials?.email,
						password: credentials?.password,
					});
					console.log('RESPONSE DATA:', response.data);
					let user = response.data;
					if (!user) {
						throw new Error('Unauthorized');
					}
					return user;
				} catch (error: any) {
					// console.log(error);
					if (error?.code === 'ECONNREFUSED')
						throw new Error('Connection Refused');
					if (error.response.status === 401) {
						throw new Error('Unauthorized');
					} else if (error.response.status === 500) {
						throw new Error('Internal server error, please try again later');
					} else if (error.response.status === 404) {
						throw new Error('Server is down');
					}
					return {
						error: error.response.data.message,
					};
				}
			},
		}),
	],
	callbacks: {
		async session({ session, token, user }) {
			return {
				...session,
				user: {
					...session.user,
					image: null,
					id: token.sub,
					accessToken: token.accessToken,
				},
			};
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.accessToken = user.accessToken;
			}

			return token;
		},
		async redirect({ url, baseUrl }) {
			return baseUrl;
		},
	},
	events: {
		session(message) {
			// console.log('session message:', message);
		},
	},
	pages: {
		signIn: '/signin',
		error: '/signin',
	},
};

export default NextAuth(authOptions);
