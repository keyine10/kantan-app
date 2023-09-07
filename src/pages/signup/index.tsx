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

export default function SignUp() {
	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
			name: '',
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
										<FormControl>
											<FormLabel htmlFor="name">Name</FormLabel>
											<Input
												id="name"
												type="name"
												name="name"
												value={formik.values.name}
												onChange={formik.handleChange}
											/>
										</FormControl>
										<FormControl>
											<FormLabel htmlFor="email">Email</FormLabel>
											<Input
												id="email"
												type="email"
												name="email"
												value={formik.values.email}
												onChange={formik.handleChange}
											/>
										</FormControl>
										<PasswordField
											onChange={formik.handleChange}
											value={formik.values.password}
										/>
									</Stack>

									<Stack spacing="6">
										<Button
											colorScheme="purple"
											type="submit"
											isLoading={formik.isSubmitting}
										>
											Create account
										</Button>
									</Stack>
									<Text color="fg.muted">
										Already have an account?{' '}
										<Link href="#" color="blue">
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
	);
}
