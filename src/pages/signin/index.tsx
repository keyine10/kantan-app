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

export default function SignIn() {
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
								<Stack spacing="5">
									<FormControl>
										<FormLabel htmlFor="email">Email</FormLabel>
										<Input id="email" type="email" />
									</FormControl>
									<PasswordField />
								</Stack>
								{/* <HStack justify="space-between">
                                <Checkbox defaultChecked>Remember me</Checkbox>
                                <Button variant="text" size="sm">
                                    Forgot password?
                                </Button>
                            </HStack> */}
								<Stack spacing="6">
									<Button colorScheme="purple">Sign in</Button>
								</Stack>
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
