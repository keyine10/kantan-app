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

import { Field, Form, Formik, useFormik } from 'formik';
import { useRef, useState } from 'react';

export default function SignIn() {
	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
		},
		onSubmit: (values) => {
			console.log(values);
			setTimeout(() => {
				//ending submission
				formik.setSubmitting(false);
			}, 2000);
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
							// boxShadow={{ base: 'none', sm: 'md' }}
							// borderRadius={{ base: 'none', sm: 'xl' }}
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
												// onClick={handleOnClickSubmit}
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
