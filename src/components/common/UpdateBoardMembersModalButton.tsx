import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import {
	useDisclosure,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	FormControl,
	Input,
	Stack,
	Flex,
	HStack,
	Text,
	IconButton,
	Box,
	Avatar,
	VStack,
	FormErrorMessage,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
} from '@chakra-ui/react';
import { useState } from 'react';
import { User } from '../../types/user';
import { BsPersonAdd } from 'react-icons/bs';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function MemberCard({
	member,
	isUserBoardCreator,
	handleRemoveBoardMember,
	creatorId,
}: {
	member: User;
	isUserBoardCreator: boolean;
	handleRemoveBoardMember: any;
	creatorId: string;
}) {
	return (
		<Flex alignItems={'center'} justifyContent={'space-between'}>
			<HStack>
				<Avatar size={'sm'} name={member.name} src="" />
				<Flex direction={'column'}>
					<Text>
						{member.name +
							(Number(member.id) === Number(creatorId) ? ' (creator)' : '')}
					</Text>
					<Text fontSize={'sm'} color={'gray.500'}>
						{member.email}
					</Text>
				</Flex>
			</HStack>
			{isUserBoardCreator && Number(member.id) !== Number(creatorId) ? (
				<Menu>
					<MenuButton as={IconButton} icon={<ChevronDownIcon />}></MenuButton>
					<MenuList px={2}>
						<MenuItem
							icon={<DeleteIcon />}
							onClick={() => handleRemoveBoardMember(member.email)}
						>
							Remove Member
						</MenuItem>
					</MenuList>
				</Menu>
			) : (
				<></>
			)}
		</Flex>
	);
}

function PendingMemberCard({
	pendingMemberEmail,
	handleRemoveBoardMember,
	isUserBoardCreator,
}: {
	pendingMemberEmail: string;
	handleRemoveBoardMember: any;
	isUserBoardCreator: boolean;
}) {
	return (
		<Flex alignItems={'center'} justifyContent={'space-between'}>
			<HStack>
				<Avatar size={'sm'} src="" />
				<Flex direction={'column'}>
					<Text>{pendingMemberEmail}</Text>
					<Text fontSize={'sm'} color={'gray.400'}>
						{'Account not created'}
					</Text>
				</Flex>
			</HStack>
			{isUserBoardCreator ? (
				<Menu>
					<MenuButton as={IconButton} icon={<ChevronDownIcon />}></MenuButton>
					<MenuList px={2}>
						<MenuItem
							icon={<DeleteIcon />}
							onClick={() => {
								handleRemoveBoardMember(pendingMemberEmail);
							}}
						>
							Remove Member
						</MenuItem>
					</MenuList>
				</Menu>
			) : (
				<></>
			)}
		</Flex>
	);
}
export function UpdateBoardMembersModalButton({
	user,
	creatorId,
	members,
	pendingMembers,
	handleUpdateBoardMembers,
	handleRemoveBoardMember,
}: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isUserBoardCreator = Number(creatorId) === Number(user.id);
	const formik = useFormik({
		initialValues: {
			email: '',
		},
		validationSchema: Yup.object().shape({
			email: Yup.string()
				.email('Email must be a valid email.')
				.required('Email is required.'),
		}),
		onSubmit: async (values) => {
			formik.setSubmitting(true);
			console.log('Inviting', values);
			await handleUpdateBoardMembers(values.email);
			formik.resetForm();
		},
	});

	return (
		<>
			<Button
				onClick={onOpen}
				variant={'solid'}
				colorScheme={'teal'}
				size={'sm'}
				display={{ base: 'none', sm: 'flex' }}
				mr={4}
				leftIcon={<BsPersonAdd size={18} />}
			>
				{isUserBoardCreator ? 'Share Board' : 'Members'}
			</Button>

			<IconButton
				onClick={onOpen}
				variant={'solid'}
				colorScheme={'teal'}
				display={{ base: 'flex', sm: 'none' }}
				size={'sm'}
				mr={2}
				icon={<BsPersonAdd size={18} />}
				aria-label={'Add Member'}
			/>
			<Modal
				onClose={onClose}
				size={'xl'}
				isOpen={isOpen}
				isCentered
				scrollBehavior="inside"
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						{isUserBoardCreator ? 'Share Board' : 'Members'}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						{isUserBoardCreator ? (
							<>
								<form onSubmit={formik.handleSubmit}>
									<FormControl
										isRequired
										isInvalid={
											formik.errors.email && formik.errors.email ? true : false
										}
									>
										<HStack align={'center'} justify={'center'} spacing={5}>
											<Input
												id="email"
												type="email"
												name="email"
												value={formik.values.email}
												onChange={formik.handleChange}
												placeholder="Enter email address"
												autoComplete="off"
											/>
											<Button
												bg={'blue.400'}
												color={'white'}
												_hover={{
													bg: 'blue.500',
												}}
												type="submit"
												isLoading={formik.isSubmitting}
											>
												Invite
											</Button>
										</HStack>
										<FormErrorMessage>{formik.errors.email}</FormErrorMessage>
									</FormControl>
								</form>
							</>
						) : (
							<></>
						)}

						<Stack spacing={4} mt={4}>
							{members.map((member: User) => (
								<MemberCard
									key={member.id}
									member={member}
									handleRemoveBoardMember={handleRemoveBoardMember}
									isUserBoardCreator={isUserBoardCreator}
									creatorId={creatorId}
								/>
							))}
							{pendingMembers.map((pendingMemberEmail: any) => (
								<PendingMemberCard
									key={pendingMemberEmail}
									pendingMemberEmail={pendingMemberEmail}
									handleRemoveBoardMember={handleRemoveBoardMember}
									isUserBoardCreator={isUserBoardCreator}
								/>
							))}
						</Stack>
					</ModalBody>
					<ModalFooter>
						{/* <Button onClick={onClose}>Close</Button> */}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
