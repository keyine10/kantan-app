import { PasswordField } from '@/components/auth/PasswordField';
import {
	Box,
	Button,
	Container,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Link,
	Stack,
	Text,
} from '@chakra-ui/react';

import { useFormik } from 'formik';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

import {
	useSession,
	signIn,
	getProviders,
	getCsrfToken,
} from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
	const { data: session } = useSession();
	//TODO: add error display
	const [error, setError] = useState(false);
	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
		},
		onSubmit: async (values) => {
			console.log(values);
			//ending submission
			const res = await signIn('credentials', {
				email: values.email,
				password: values.password,
				redirect: false,
				callbackUrl: '',
			});
			console.log(res);
			if (res?.status === 401) setError(true);
			else setError(false);
			formik.setSubmitting(false);
		},
	});

	return (
		<Flex height="100vh">
			<Container
				maxW={{ base: 'xl', md: '50%' }}
				boxShadow={{ base: 'none', sm: 'md' }}
			>
				<Container
					maxW="xl"
					py={{ base: '12', md: '24' }}
					px={{ base: '0', sm: '8' }}
					m="auto"
				>
					<Stack spacing="8">
						<Stack spacing="6">
							{/* <Logo /> */}
							<Heading size={{ base: 'lg', md: 'xl' }} textAlign="center">
								Kantan
							</Heading>
							<Stack spacing={{ base: '2', md: '3' }} textAlign="center">
								<Heading size={{ base: 'sm', md: 'lg' }}>
									Log in to your account
								</Heading>
							</Stack>
						</Stack>
						<Box
							py={{ base: '0', sm: '8' }}
							px={{ base: '4', sm: '10' }}
							bg={{ base: 'transparent', sm: 'bg.surface' }}
						>
							<Stack spacing="6">
								<form onSubmit={formik.handleSubmit}>
									<FormControl>
										<Stack spacing="6">
											<div>
												<FormLabel htmlFor="email">Email</FormLabel>
												<Input
													id="email"
													name="email"
													type="email"
													value={formik.values.email}
													onChange={formik.handleChange}
												/>
											</div>
											<PasswordField
												value={formik.values.password}
												onChange={formik.handleChange}
											/>
											<Button
												colorScheme="purple"
												type="submit"
												isLoading={formik.isSubmitting}
											>
												Sign in
											</Button>
										</Stack>
									</FormControl>
								</form>
								<Text color="fg.muted">
									Don't have an account?{' '}
									<Link href="#" color="blue">
										Sign up
									</Link>
								</Text>
							</Stack>
						</Box>
					</Stack>
				</Container>
			</Container>
			<Container
				maxW={{ base: '0', md: '50%' }}
				p="0"
				margin="0"
				bgGradient="linear(to-r,blue.600, blue.400)"
			></Container>
		</Flex>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, authOptions);
	// If the user is already logged in, redirect.
	// Note: Make sure not to redirect to the same page
	// To avoid an infinite loop!

	//TODO: redirect
	// if (session) {
	// 	return { redirect: { destination: '/' } };
	// }

	return {
		props: {},
	};
}
