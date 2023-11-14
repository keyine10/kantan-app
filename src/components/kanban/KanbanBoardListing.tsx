import {
	Box,
	Button,
	Heading,
	Popover,
	PopoverTrigger,
	Stack,
	Wrap,
	WrapItem,
	Text,
	useDisclosure,
	IconButton,
	Flex,
	PopoverArrow,
	PopoverContent,
	PopoverCloseButton,
	PopoverFooter,
	ButtonGroup,
	PopoverHeader,
	PopoverBody,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Input,
	Skeleton,
	Link,
	Spinner,
	InputGroup,
	InputLeftElement,
	Center,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, Search2Icon } from '@chakra-ui/icons';
import { KanbanBoardModel } from '../../types/kanban-board';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NextLink from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { useDebounce } from '@uidotdev/usehooks';

export default function KanbanBoardListing({
	boards = [],
	isLoading,
	createBoard,
	deleteBoard,
	user,
	toast,
}: {
	isLoading: boolean;
	boards: KanbanBoardModel[];
	createBoard: ({
		title,
		description,
	}: {
		title: string;
		description: string;
	}) => void;
	deleteBoard: (id: string) => void;
	user: any;
	toast: any;
}) {
	const { onOpen, onClose, isOpen } = useDisclosure();
	const [isDeletingBoardId, setisDeletingBoardId] = useState('');
	const [searchResults, setSearchResults] = useState(boards);
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 400);

	const inputFocusRef = useRef(null);
	const fuse = new Fuse(boards, {
		keys: ['title', 'description'],
		includeScore: true,
		threshold: 0.1,
		findAllMatches: true,
	});
	useEffect(() => {
		if (debouncedSearchTerm.length === 0) {
			setSearchResults(boards);
			return;
		}
		const results = fuse.search(debouncedSearchTerm);
		const foundBoards = results.map((result) => result.item);
		setSearchResults(foundBoards);
		// console.log('search results:', results);
	}, [debouncedSearchTerm]);
	const formik = useFormik({
		initialValues: {
			title: '',
			description: '',
		},
		validationSchema: Yup.object().shape({
			title: Yup.string().required('Title is required'),
		}),
		onSubmit: async (values) => {
			console.log(values);

			try {
				await createBoard(values);
				formik.resetForm();
				onClose();
			} catch (error) {
				console.log(error);
			}
		},
	});

	if (isLoading) {
		return (
			<div>
				<Skeleton></Skeleton>
			</div>
		);
	}

	return (
		<Stack spacing={8} alignContent={'flex-start'}>
			<Heading>Your boards</Heading>
			<Box>
				<Center>
					<InputGroup width={'50%'}>
						<InputLeftElement pointerEvents="none">
							<Search2Icon color="gray.300" />
						</InputLeftElement>
						<Input
							type="search"
							placeholder="Search"
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</InputGroup>
				</Center>
			</Box>

			<Wrap>
				{searchResults.map((board: any) => (
					<WrapItem key={board.id}>
						<Box m={2}>
							<Link
								as={NextLink}
								href={
									isDeletingBoardId === board.id ? '/' : `/boards/${board.id}`
								}
							>
								<Flex
									bgColor="gray.50"
									height="100px"
									width="272px"
									p={2}
									borderRadius={8}
									_hover={{
										bgColor: 'gray.300',
									}}
									border={'4px solid transparent'}
									borderColor={
										board.backgroundColor ? board.backgroundColor : 'black'
									}
									cursor={'pointer'}
									userSelect={'none'}
									transition={'all 0.2s ease'}
									justifyContent={'space-between'}
								>
									<Text textDecoration={'none'}>{board.title}</Text>
									{Number(board.creatorId) === Number(user.id) && (
										<IconButton
											float={'right'}
											aria-label="options"
											size="md"
											opacity={0.7}
											_hover={{ opacity: 1, backgroundColor: 'gray.200' }}
											variant="ghost"
											colorScheme="gray"
											icon={<DeleteIcon />}
											zIndex={10}
											isLoading={isDeletingBoardId === board.id}
											onClick={async (e) => {
												e.preventDefault();
												e.stopPropagation();

												try {
													setisDeletingBoardId(board.id);
													await deleteBoard(board.id);
													setisDeletingBoardId('');
												} catch (error) {
													setisDeletingBoardId('');
												}
											}}
										/>
									)}
								</Flex>
							</Link>
						</Box>
					</WrapItem>
				))}

				<Popover
					isOpen={isOpen}
					initialFocusRef={inputFocusRef}
					onOpen={onOpen}
					onClose={onClose}
					placement="right"
				>
					<WrapItem>
						<Box m={2}>
							<Button
								size="md"
								height="100px"
								width="272px"
								leftIcon={<AddIcon />}
								variant="solid"
								onClick={() => {
									if (boards.length >= 12) {
										toast({
											status: 'warning',
											title: 'Maximum number of boards reached',
											isClosable: true,
											position: 'bottom-left',
											variant: 'left-accent',
											length: 3000,
										});
										return;
									}
									onOpen();
								}}
							>
								Create a new board
							</Button>
						</Box>
					</WrapItem>
					<PopoverContent p={5}>
						<PopoverHeader>Create a new board</PopoverHeader>
						<PopoverArrow />
						<PopoverCloseButton />
						<form onSubmit={formik.handleSubmit}>
							<PopoverBody>
								<Stack spacing="6">
									<FormControl
										isRequired
										isInvalid={
											formik.errors.title && formik.errors.title ? true : false
										}
									>
										<FormLabel htmlFor="title">Title</FormLabel>
										<Input
											id="title"
											type="title"
											name="title"
											isRequired
											autoFocus
											ref={inputFocusRef}
											value={formik.values.title}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
										/>
										<FormErrorMessage>{formik.errors.title}</FormErrorMessage>
									</FormControl>
									<FormControl>
										<FormLabel htmlFor="description">Description</FormLabel>
										<Input
											id="description"
											type="description"
											name="description"
											value={formik.values.description}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
										/>
									</FormControl>
								</Stack>
							</PopoverBody>

							<PopoverFooter border="0" pb={4}>
								<Stack dir="row">
									<Button
										width="100%"
										colorScheme="blue"
										type="submit"
										isLoading={formik.isSubmitting}
									>
										Create
									</Button>
								</Stack>
							</PopoverFooter>
						</form>
					</PopoverContent>
				</Popover>
			</Wrap>
		</Stack>
	);
}
