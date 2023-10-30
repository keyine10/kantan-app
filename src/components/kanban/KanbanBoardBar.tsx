'use client';

import {
	Box,
	Flex,
	Text,
	IconButton,
	Button,
	useColorModeValue,
	Portal,
	Input,
	useToast,
	useDisclosure,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	AvatarGroup,
	Avatar,
	AvatarBadge,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverHeader,
	HStack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';

import { ChangeEvent, useRef, useState } from 'react';
import { KanbanBoardModel } from '../../types/kanban-board';
import { boardService } from '../../services/board.service';
import { UpdateBoardMembersModalButton } from '../common/UpdateBoardMembersModalButton';
import { User } from '../../types/user';

interface Props {
	children: React.ReactNode;
	link: string;
}

function ActiveMembersAvatarGroup({ members }: { members: User[] }) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Popover isLazy>
			<PopoverTrigger>
				<AvatarGroup
					mr={2}
					max={4}
					onClick={() => {
						console.log('avatargroup');
					}}
					cursor={'pointer'}
					size={'sm'}
				>
					{members.map((member) => (
						<Avatar key={member.id} name={member.name} src="">
							<AvatarBadge
								borderColor="papayawhip"
								bg="tomato"
								boxSize="1.25em"
							/>
						</Avatar>
					))}
				</AvatarGroup>
			</PopoverTrigger>
			<Portal>
				<PopoverContent width={'fit-content'}>
					<PopoverArrow />
					<PopoverHeader>Active Members</PopoverHeader>
					<PopoverBody>
						{members.map((member) => (
							<HStack key={member.id}>
								<Avatar size={'sm'} name={member.name} src="">
									<AvatarBadge
										borderColor="papayawhip"
										bg="tomato"
										boxSize="1.25em"
									/>
								</Avatar>
								<Flex direction={'column'}>
									<Text>{member.name}</Text>
									<Text fontSize={'sm'} color={'gray.500'}>
										{member.email}
									</Text>
								</Flex>
							</HStack>
						))}
					</PopoverBody>
				</PopoverContent>
			</Portal>
		</Popover>
	);
}

export default function KanbanBoardBar({
	board,
	mutate,
	user,
	activeMembers,
}: {
	board: KanbanBoardModel;
	mutate: any;
	user: any;
	activeMembers: User[];
}) {
	const [isEditingBoardName, setIsEditingBoardName] = useState(false);
	const textareaRef = useRef(null);
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const btnRef = useRef(null);
	const handleUpdateBoardName = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setIsEditingBoardName(false);
		if (event.target.value === board.title) return;
		try {
			await mutate(
				async (board: KanbanBoardModel) => {
					let updatedBoard = await boardService.updateBoard(
						{
							title: event.target.value,
							id: board.id,
						},
						user.accessToken,
					);
					return {
						...board,
						title: updatedBoard.title,
					};
				},
				{
					optimisticData: {
						...board,
						title: event.target.value,
					},
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
		} catch (e) {
			toast({
				status: 'error',
				title: 'Error',
				description: 'Cannot rename board',
				isClosable: true,
				position: 'bottom-left',
				duration: 5000,
			});
		}
		return;
	};
	const handleUpdateBoardMembers = async (email: string) => {
		try {
			let res = await boardService.addMember(
				{ email, id: board.id },
				user.accessToken,
			);
			mutate(
				(board: KanbanBoardModel) => {
					return {
						...board,
						members: [...res.members],
						pendingMembers: [...res.pendingMembers],
					};
				},
				{
					rollbackOnError: true,
					populateCache: true,
					revalidate: false,
				},
			);
			toast({
				status: 'success',
				title: 'Successfully updated board members',
				isClosable: true,
				position: 'top',
				duration: 5000,
			});
		} catch (e: any) {
			if (e.response.status === 409)
				toast({
					status: 'error',
					title: 'Error',
					description: 'Email already exists',
					isClosable: true,
					position: 'top',
					duration: 5000,
				});
			else
				toast({
					status: 'error',
					title: 'Error',
					description: 'Cannot update board members',
					isClosable: true,
					position: 'top',
					duration: 5000,
				});
			mutate();
		}
	};
	return (
		<>
			<Box bg={useColorModeValue('gray.100', 'gray.900')} px={2} py={2}>
				<Flex alignItems={'center'} justifyContent={'space-between'}>
					<Box px={2} py={1}>
						{isEditingBoardName ? (
							<Input
								maxH="32px"
								overflow={'hidden'}
								_active={{
									width: 'auto',
								}}
								defaultValue={board.title}
								maxLength={50}
								maxWidth={'200px'}
								// focusBorderColor="none"
								onBlur={handleUpdateBoardName}
								onFocus={(event: any) => {
									event.target.selectionEnd = event.target.value.length;
								}}
								onKeyDown={(event: any) => {
									if (event.key === 'Enter') {
										handleUpdateBoardName(event);
										setIsEditingBoardName(false);
									}
									if (event.key === 'Escape') {
										setIsEditingBoardName(false);
									}
								}}
								autoFocus
								bgColor="white"
							/>
						) : (
							<Text
								border={'none'}
								p={1}
								fontSize={16}
								onClick={() => {
									setIsEditingBoardName(true);
								}}
								cursor={'pointer'}
								textOverflow="ellipsis"
								overflow={'hidden'}
								maxH={'32px'}
								maxW={'10em'}
								whiteSpace={'nowrap'}
							>
								{board.title}
							</Text>
						)}
					</Box>
					<Flex alignItems={'center'}>
						<ActiveMembersAvatarGroup members={activeMembers} />
						<UpdateBoardMembersModalButton
							user={user}
							members={board.members}
							creatorId={board.creatorId}
							pendingMembers={board.pendingMembers}
							handleUpdateBoardMembers={handleUpdateBoardMembers}
						/>
						<>
							<IconButton
								ref={btnRef}
								size={'sm'}
								colorScheme="teal"
								onClick={onOpen}
								aria-label="board options"
								icon={<HamburgerIcon />}
							/>
							<Drawer
								isOpen={isOpen}
								placement="right"
								onClose={onClose}
								finalFocusRef={btnRef}
							>
								<DrawerOverlay />
								<DrawerContent>
									<DrawerCloseButton />
									<DrawerHeader>Create your account</DrawerHeader>

									<DrawerBody>
										<Input placeholder="Type here..." />
									</DrawerBody>

									<DrawerFooter>
										<Button variant="outline" mr={3} onClick={onClose}>
											Cancel
										</Button>
										<Button colorScheme="blue">Save</Button>
									</DrawerFooter>
								</DrawerContent>
							</Drawer>
						</>
					</Flex>
				</Flex>
			</Box>

			{/* <Box p={4}>Main Content Here</Box> */}
		</>
	);
}
