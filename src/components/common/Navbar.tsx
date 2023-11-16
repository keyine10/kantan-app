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
import tinycolor from 'tinycolor2';

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
			fontSize={'xl'}
			rounded={'md'}
			_hover={{
				textDecoration: 'none',
				bg: useColorModeValue('gray.400', 'gray.700'),
			}}
			href={props.link}
		>
			{children}
		</Box>
	);
};

export default function Navbar({ bgColor }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { data: session, status } = useSession();
	const user = session?.user;
	const handleSignOut = () => {
		signOut({ redirect: true, callbackUrl: '/signin' });
	};

	return (
		<>
			<Box px={2} bgColor={bgColor}>
				<Flex h={12} alignItems={'center'} justifyContent={'space-between'}>
					<HStack spacing={8} alignItems={'center'}>
						<HStack
							as={'nav'}
							spacing={4}
							display={{ base: 'flex', md: 'flex' }}
						>
							<NavLink key={'Boards'} link={'/'}>
								<Text
									color={
										tinycolor(bgColor).getLuminance() < 0.5 ? 'white' : 'black'
									}
								>
									Kantan
								</Text>
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
								icon={<Avatar name={user?.name} src="" size={'sm'} />}
								fontSize="30px"

								// minW={0}
							></MenuButton>
							<Portal>
								<MenuList zIndex={100} px={2}>
									<Text align={'center'}>Hello, {user?.name}</Text>
									<MenuDivider />

									{/* <MenuItem>Edit Profile</MenuItem> */}
									<MenuDivider />
									<MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
								</MenuList>
							</Portal>
						</Menu>
					</Flex>
				</Flex>
			</Box>

			{/* <Box p={4}>Main Content Here</Box> */}
		</>
	);
}
