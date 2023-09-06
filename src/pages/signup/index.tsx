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

export default function SignUp() {
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
							<Stack spacing="6">
								<Stack spacing="5">
									<FormControl>
										<FormLabel htmlFor="name">Name</FormLabel>
										<Input id="name" type="name" />
									</FormControl>
									<FormControl>
										<FormLabel htmlFor="email">Email</FormLabel>
										<Input id="email" type="email" />
									</FormControl>
									<PasswordField />
								</Stack>

								<Stack spacing="6">
									<Button colorScheme="purple">Create account</Button>
								</Stack>
								<Text color="fg.muted">
									Already have an account?{' '}
									<Link href="#" color="blue">
										Sign In
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
