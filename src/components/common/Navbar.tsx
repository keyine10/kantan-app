'use client';

import {
	Box,
	Flex,
	Avatar,
	HStack,
	Text,
	IconButton,
	Button,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	useDisclosure,
	useColorModeValue,
	Stack,
	Portal,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';

import { RxAvatar } from 'react-icons/rx';
import { useSession, signOut } from 'next-auth/react';

interface Props {
	children: React.ReactNode;
	link: string;
}

const Links = ['Boards'];

const NavLink = (props: Props) => {
	const { children } = props;
	return (
		<Box
			as="a"
			px={2}
			py={1}
			rounded={'md'}
			_hover={{
				textDecoration: 'none',
				bg: useColorModeValue('gray.200', 'gray.700'),
			}}
			href={props.link}
		>
			{children}
		</Box>
	);
};

export default function Navbar() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { data: session, status } = useSession();
	const user = session?.user;
	const handleSignOut = () => {
		signOut({ redirect: true, callbackUrl: '/signin' });
	};
	return (
		<>
			<Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
				<Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
					<IconButton
						size={'md'}
						icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
						aria-label={'Open Menu'}
						display={{ md: 'none' }}
						onClick={isOpen ? onClose : onOpen}
					/>
					<HStack spacing={8} alignItems={'center'}>
						<Box>Kantan</Box>
						<HStack
							as={'nav'}
							spacing={4}
							display={{ base: 'none', md: 'flex' }}
						>
							<NavLink key={'Boards'} link={'/'}>
								Boards
							</NavLink>
						</HStack>
					</HStack>
					<Flex alignItems={'center'}>
						{/* <Button
							variant={'solid'}
							colorScheme={'teal'}
							size={'sm'}
							mr={4}
							leftIcon={<AddIcon />}
						>
							Action
						</Button> */}
						<Menu>
							<MenuButton
								as={IconButton}
								rounded={'full'}
								variant={'link'}
								cursor={'pointer'}
								icon={<RxAvatar />}
								fontSize="30px"

								// minW={0}
							></MenuButton>
							<Portal>
								<MenuList zIndex={3000}>
									<Text align={'center'}>Hello, {user?.name}</Text>
									<MenuDivider />

									<MenuItem>Edit Profile</MenuItem>
									{/* <MenuItem>Link 2</MenuItem> */}
									<MenuDivider />
									<MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
								</MenuList>
							</Portal>
						</Menu>
					</Flex>
				</Flex>

				{isOpen ? (
					<Box pb={4} display={{ md: 'none' }}>
						<Stack as={'nav'} spacing={4}>
							{Links.map((link) => (
								<NavLink key={link}>{link}</NavLink>
							))}
						</Stack>
					</Box>
				) : null}
			</Box>

			{/* <Box p={4}>Main Content Here</Box> */}
		</>
	);
}
