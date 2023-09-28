import { PasswordField } from '@/components/auth/PasswordField';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Box,
	Button,
	Container,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Link,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { userService } from '../../services/user.service';
import * as Yup from 'yup';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Head from 'next/head';

const validationSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email.').required('Email is required.'),
	password: Yup.string()
		.min(10, 'Password must be longer than 10 characters.')
		.required('Password is required.'),
	name: Yup.string()
		.min(4, 'Name must be at least 4 characters.')
		.max(20, 'Name must not be longer than 10 characters.')
		.required('Name is required.'),
});

export default function SignUp() {
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
			name: '',
		},
		validationSchema,
		onSubmit: async (values) => {
			console.log(values);

			try {
				const response = await userService.signUp(
					values.name,
					values.email,
					values.password,
				);
				console.log(response);
				console.log('response:', response);
				setSuccess(true);
				setError('');
				const res = await signIn('credentials', {
					email: values.email,
					password: values.password,
					redirect: false,
					callbackUrl: '',
				});
				console.log(res);

				// setError('');
			} catch (error: any) {
				console.log(error);
				if (error.response.status === 409)
					setError('Email already exists! Please sign up with another email.');
				if (error.response.status === 500)
					setError('Internal server error, please try again later.');
				if (error.response.status === 400 || error.response.status === 401)
					setError('Email or Password is invalid!');
				formik.setSubmitting(false);
				setSuccess(false);
			}
		},
	});

	return (
		<>
			<Head>
				<title>Sign up to Kantan</title>
				<meta name="description" content="Kantan Sign Up Page" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Flex height="100vh">
				<Container maxW={{ base: 'xl', md: '50%' }} alignContent={'center'}>
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
										Create an account{' '}
									</Heading>
								</Stack>
							</Stack>
							<Box
								py={{ base: '0', sm: '8' }}
								px={{ base: '4', sm: '10' }}
								bg={{ base: 'transparent', sm: 'bg.surface' }}
							>
								<form onSubmit={formik.handleSubmit}>
									<Stack spacing="6">
										<Stack spacing="5">
											<FormControl
												isRequired
												isInvalid={
													formik.errors.name && formik.errors.name
														? true
														: false
												}
											>
												<FormLabel htmlFor="name">Name</FormLabel>
												<Input
													id="name"
													type="name"
													name="name"
													isRequired
													value={formik.values.name}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
												/>
												<FormErrorMessage>
													{formik.errors.name}
												</FormErrorMessage>
											</FormControl>
											<FormControl
												isRequired
												isInvalid={
													formik.errors.email && formik.errors.email
														? true
														: false
												}
											>
												<FormLabel htmlFor="email">Email</FormLabel>
												<Input
													id="email"
													type="email"
													name="email"
													value={formik.values.email}
													onChange={formik.handleChange}
												/>
												<FormErrorMessage>
													{formik.errors.email}
												</FormErrorMessage>
											</FormControl>
											<FormControl
												isInvalid={formik.errors.password ? true : false}
											>
												<PasswordField
													isRequired
													onChange={formik.handleChange}
													value={formik.values.password}
												/>
												<FormErrorMessage>
													{formik.errors.password}
												</FormErrorMessage>
											</FormControl>
										</Stack>

										<Stack spacing="6">
											<Button
												colorScheme="purple"
												type="submit"
												isLoading={formik.isSubmitting}
											>
												Create account
											</Button>
											{error && (
												<Alert status="error">
													<AlertIcon />
													<AlertTitle>{error}</AlertTitle>
												</Alert>
											)}
											{success && (
												<Alert status="success">
													<AlertIcon />
													<AlertTitle>
														Signed up successfully, signing in...
													</AlertTitle>
												</Alert>
											)}
										</Stack>
										<Text color="fg.muted">
											Already have an account?{' '}
											<Link href="/signin" color="blue">
												Sign In
											</Link>
										</Text>
									</Stack>
								</form>
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
		</>
	);
}
