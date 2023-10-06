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
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { KanbanBoardModel } from '../../types/kanban-board';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NextLink from 'next/link';
import { useRef, useState } from 'react';

export default function KanbanBoardListing({
	boards = [],
	isLoading,
	createBoard,
	deleteBoard,
}: {
	isLoading: boolean;
	boards: KanbanBoardModel[];
	mutate: () => void;
	createBoard: ({
		title,
		description,
	}: {
		title: string;
		description: string;
	}) => void;
	deleteBoard: (id: string) => void;
}) {
	const { onOpen, onClose, isOpen } = useDisclosure();
	const [isDeletingBoardId, setisDeletingBoardId] = useState('');
	const inputFocusRef = useRef(null);

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

			<Wrap>
				{boards.map((board: any) => (
					<WrapItem key={board.id}>
						<Box m={2}>
							<Link
								as={NextLink}
								href={
									isDeletingBoardId === board.id ? '/' : `/boards/${board.id}`
								}
							>
								<Flex
									bgColor="gray.200"
									height="100px"
									width="272px"
									p={4}
									borderRadius={8}
									_hover={{
										bgColor: 'gray.300',
									}}
									cursor={'pointer'}
									userSelect={'none'}
									transition={'all 0.2s ease'}
									justifyContent={'space-between'}
								>
									<Text textDecoration={'none'}>{board.title}</Text>
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
					<PopoverTrigger>
						<WrapItem>
							<Box m={2}>
								<Button
									size="md"
									height="100px"
									width="272px"
									leftIcon={<AddIcon />}
									variant="solid"
								>
									Create a new board
								</Button>
							</Box>
						</WrapItem>
					</PopoverTrigger>
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
