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
	Divider,
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
	VStack,
	Center,
	Icon,
	Heading,
} from '@chakra-ui/react';
import {
	HamburgerIcon,
	CloseIcon,
	AddIcon,
	DeleteIcon,
} from '@chakra-ui/icons';
import { FaAlignLeft, FaCircleUser, FaImage } from 'react-icons/fa6';

import { ChangeEvent, useRef, useState } from 'react';
import { KanbanBoardModel } from '../../types/kanban-board';
import { boardService } from '../../services/board.service';
import { UpdateBoardMembersModalButton } from '../common/UpdateBoardMembersModalButton';
import { User } from '../../types/user';
import { ConfirmModalWrapper } from '../common/ConfirmModalWrapper';
import { ColorPickerWrapper } from '../common/ColorPickerWrapper';
import tinycolor from 'tinycolor2';
import { useRouter } from 'next/router';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';

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
	const [isEditingBoardDescription, setIsEditingBoardDescription] =
		useState(false);

	const boardDescriptionRef = useRef<HTMLTextAreaElement>(null);
	const toast = useToast();
	const {
		isOpen: isOpenDrawer,
		onOpen: onOpenDrawer,
		onClose,
	} = useDisclosure();
	const onCloseDrawer = () => {
		setIsEditingBoardDescription(false);
		onClose();
	};

	const btnRef = useRef(null);
	const router = useRouter();

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
	const handleUpdateBoardDescription = async (description: string) => {
		setIsEditingBoardDescription(false);

		try {
			await mutate(
				async (board: KanbanBoardModel) => {
					let updatedBoard = await boardService.updateBoard(
						{
							description: description,
							id: board.id,
						},
						user.accessToken,
					);
					return {
						...board,
						description: updatedBoard.description,
					};
				},
				{
					optimisticData: {
						...board,
						description: description,
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
				description: 'Cannot update board description',
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
	const handleRemoveBoardMember = async (email: string) => {
		try {
			let res = await boardService.removeMember(
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
				title: 'Successfully removed board member',
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
					description: 'Cannot remove board member',
					isClosable: true,
					position: 'top',
					duration: 5000,
				});
			mutate();
		}
	};
	const handleUpdateBackgroundColor = async (color: string) => {
		let updatedBoard = await boardService.updateBoard(
			{
				...board,
				backgroundColor: color,
			},
			user.accessToken,
		);
	};
	const handleRemoveBackgroundColor = async () => {
		let updatedBoard = await boardService.updateBoard(
			{
				id: board.id,
				backgroundColor: 'gray.200',
			},
			user.accessToken,
		);
	};

	const handleDeleteBoard = async () => {
		try {
			await boardService.deleteBoard(board.id, user?.accessToken);
			toast({
				status: 'success',
				title: 'Deleted board!',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
			router.push('/');
		} catch (e) {
			toast({
				status: 'error',
				title: 'Could not delete board, please try again',
				isClosable: true,
				position: 'bottom-left',
				variant: 'left-accent',
			});
		}
	};
	return (
		<>
			<Box bg="blackAlpha.400" backdropFilter="blur(40px)" px={2} py={2}>
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
								color={
									board?.backgroundColor
										? tinycolor(board.backgroundColor).getLuminance() < 0.5
											? 'white'
											: 'black'
										: 'black'
								}
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
							handleRemoveBoardMember={handleRemoveBoardMember}
						/>
						<>
							<IconButton
								ref={btnRef}
								size={'sm'}
								colorScheme="teal"
								onClick={onOpenDrawer}
								aria-label="board options"
								icon={<HamburgerIcon />}
							/>
							<Drawer
								isOpen={isOpenDrawer}
								placement="right"
								onClose={onCloseDrawer}
								finalFocusRef={btnRef}
							>
								<DrawerOverlay />
								<DrawerContent>
									<DrawerCloseButton />

									<DrawerHeader>
										<Center>Menu</Center>
									</DrawerHeader>

									<DrawerBody px="1rem">
										<VStack alignItems={'left'}>
											<Box>
												<Flex alignItems={'center'}>
													<Icon as={FaCircleUser} mr={2} />
													<Heading fontSize={'lg'} my="8px">
														Creator
													</Heading>
												</Flex>
												<HStack m="3" spacing={4}>
													<Avatar
														size={'md'}
														name={board.creator.name}
														src=""
													></Avatar>
													<Flex direction={'column'}>
														<Text>{board.creator.name}</Text>
														<Text fontSize={'sm'} color={'gray.500'}>
															{board.creator.email}
														</Text>
													</Flex>
												</HStack>
											</Box>
											<Box>
												<Flex alignItems={'center'}>
													<Icon as={FaAlignLeft} mr={2} />
													<Heading fontSize={'lg'} my="8px">
														Board Description
													</Heading>
												</Flex>
												{isEditingBoardDescription ? (
													<Box>
														<AutoResizeTextarea
															ref={boardDescriptionRef}
															overflow={'hidden'}
															defaultValue={board.description}
															minH="100px"
															maxLength={255}
															maxWidth={'100%'}
															// focusBorderColor="none"
															onFocus={(event: any) => {
																event.target.selectionEnd =
																	event.target.value.length;
															}}
															onKeyDown={(event: any) => {
																if (event.key === 'Escape') {
																	setIsEditingBoardDescription(false);
																}
															}}
															autoFocus
															bgColor="white"
														/>
														<HStack my="8px">
															<Button
																variant="solid"
																colorScheme="blue"
																size={'sm'}
																onClick={() => {
																	setIsEditingBoardDescription(false);
																	if (boardDescriptionRef.current?.value)
																		handleUpdateBoardDescription(
																			boardDescriptionRef.current?.value,
																		);
																}}
															>
																Save
															</Button>
															<Button
																variant="ghost"
																size={'sm'}
																onClick={() => {
																	setIsEditingBoardDescription(false);
																}}
															>
																Cancel
															</Button>
														</HStack>
													</Box>
												) : (
													<>
														<Button
															width={'100%'}
															height={'100%'}
															minH="148px"
															p="4"
															onClick={() => {
																setIsEditingBoardDescription(true);
															}}
															justifyContent={'left'}
															alignItems={'baseline'}
															alignContent={'left'}
														>
															<Text
																border={'none'}
																cursor={'pointer'}
																maxW={'100%'}
																whiteSpace={'normal'}
																textAlign={'left'}
															>
																{board.description
																	? board.description
																	: 'Add new description...'}
															</Text>
														</Button>
													</>
												)}
											</Box>

											<Divider />
											<ColorPickerWrapper
												handleUpdateBackgroundColor={
													handleUpdateBackgroundColor
												}
												handleRemoveBackgroundColor={
													handleRemoveBackgroundColor
												}
											>
												<Button
													justifyContent={'left'}
													leftIcon={<FaImage />}
													variant={'ghost'}
													w={'100%'}
												>
													Change background color
												</Button>
											</ColorPickerWrapper>

											<ConfirmModalWrapper
												label={'Board'}
												onDelete={handleDeleteBoard}
												width={'100%'}
											>
												{Number(board.creatorId) === Number(user.id) && (
													<Button
														justifyContent={'left'}
														leftIcon={<DeleteIcon />}
														variant={'ghost'}
														colorScheme="red"
														width={'100%'}
													>
														Delete Board
													</Button>
												)}
											</ConfirmModalWrapper>
										</VStack>
									</DrawerBody>

									{/* <DrawerFooter>
										<Button variant="outline" mr={3} onClick={onClose}>
											Cancel
										</Button>
										<Button colorScheme="blue">Save</Button>
									</DrawerFooter> */}
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
