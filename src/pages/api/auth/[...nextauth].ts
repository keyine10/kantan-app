import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const KANTAN_BACKEND_SIGNIN_ENDPOINT =
	process.env.KANTAN_BACKEND_API_ENDPOINT + '/authentication/sign-in';

export type CredentialUser = {
	id: number;
	name: string;
	email: string;
	bio: string;
	accessToken: string;
};

export const authOptions: NextAuthOptions = {
	secret: process.env.JWT_SECRET,
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
					if (!user) return false;
					return user;
				} catch (error) {
					throw new Error();
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			console.log('JWT:', user, token);

			return token;
		},
		async session({ session, token, user }) {
			// Send properties to the client, like an access_token from a provider.
			// session.accessToken = token.accessToken;
			return session;
		},
		async redirect({ url, baseUrl }) {
			return baseUrl;
		},
		async signIn({ user, credentials }) {
			console.log('User:', user);
			console.log('Credentials:', credentials);
			const isAllowedToSignIn = true;
			if (isAllowedToSignIn) {
				return true;
			} else {
				// Return false to display a default error message
				return false;
				// Or you can return a URL to redirect to:
				// return '/unauthorized'
			}
		},
	},
	pages: {
		signIn: '/signin',
	},
};

export default NextAuth(authOptions);
