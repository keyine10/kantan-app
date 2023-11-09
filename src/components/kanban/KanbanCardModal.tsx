import { AddIcon, ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
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
	Portal,
	Image,
	Link,
	useToast,
	Heading,
	Icon,
	CardBody,
	Card,
	CardFooter,
} from '@chakra-ui/react';

import { FaAlignLeft, FaPaperclip } from 'react-icons/fa6';

import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import ScreenCapture from '@uppy/screen-capture';

import Compressor from '@uppy/compressor';
import { DashboardModal } from '@uppy/react';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/screen-capture/dist/style.min.css';
import { supabase } from '../common/supabaseClient';
import { Ref, useEffect, useRef, useState } from 'react';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';

const STORAGE_BUCKET = 'dump';

const supabaseStorageURL = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;
const anonKey = `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

const getPublicURL = (bucket: string, path: string) => {
	return `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${bucket}/${path}`;
};

function AttachmentCard({ file, onDeleteFile }: any) {
	let imageSrc = file.metadata?.mimetype?.includes('image')
		? getPublicURL('dump', 'temporary folder' + '/' + file.name)
		: '';
	return (
		<Link
			href={getPublicURL('dump', 'temporary folder' + '/' + file.name)}
			isExternal
			_hover={{
				textDecor: 'unset',
			}}
		>
			<Card
				direction="row"
				overflow="hidden"
				variant="outline"
				size="sm"
				backgroundColor={'gray.50'}
				border="none"
				_hover={{ backgroundColor: 'gray.200' }}
				my="1rem"
			>
				<Image objectFit="cover" src={imageSrc} alt="Caffe Latte" width={120} />
				<Stack>
					<CardBody>
						<Heading size="sm">{file.name}</Heading>
					</CardBody>
					<CardFooter>
						<Stack direction={'row'}>
							<Button
								variant={'link'}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									onDeleteFile();
								}}
							>
								Delete
							</Button>
							<Button
								variant={'link'}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
							>
								Set as thumbnail
							</Button>
						</Stack>
					</CardFooter>
				</Stack>
			</Card>
		</Link>
	);
}

export function KanbanCardModal({ isOpen, onClose, task, updateTask }: any) {
	const {
		onOpen: onOpenUppy,
		onClose: onCloseUppy,
		isOpen: isOpenUppy,
	} = useDisclosure();
	const [files, setFiles] = useState<any>([]);
	const [isEditingTaskName, setIsEditingTaskName] = useState(false);
	const [isEditingTaskDescription, setisEditingTaskDescription] =
		useState(false);
	const toast = useToast();
	const taskDescriptionRef = useRef(null);
	// const folder = task.id;
	const folder = 'temporary folder';

	useEffect(() => {
		if (!isOpen) onCloseUppy();
		if (isOpen) getFiles();
	}, [isOpen]);
	async function getFiles() {
		const { data, error } = await supabase.storage
			.from('dump')
			.list('temporary folder');
		if (error) return;
		setFiles(data);
		console.log('files:', data);
	}
	async function deleteFile(file: any) {
		const { data, error } = await supabase.storage
			.from('dump')
			.remove([`temporary folder/${file.name}`]);
		if (data)
			setFiles((prevFiles: any) =>
				prevFiles.filter((f: any) => f.name !== file.name),
			);
		if (error) {
			toast({
				title: 'Error',
				description: error.message,
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
		console.log('deleted file', data);
	}

	const [uppy] = useState(() =>
		new Uppy({
			locale: {
				strings: {
					dropPasteImportFiles: 'Drop files here, or browse from:',
				},
			},
			restrictions: {
				maxFileSize: 4 * 1024 * 1024,
				maxNumberOfFiles: 5,
				minNumberOfFiles: 1,
				allowedFileTypes: null,
			},
		})
			.use(Tus, {
				endpoint: supabaseStorageURL,
				headers: {
					authorization: `Bearer ${anonKey}`,
					apikey: anonKey,
				},
				chunkSize: 4 * 1024 * 1024,
				allowedMetaFields: [
					'bucketName',
					'objectName',
					'contentType',
					'cacheControl',
				],
			})
			.use(Compressor)
			.use(ScreenCapture),
	);
	useEffect(() => {
		uppy.on('file-added', (file) => {
			const supabaseMetadata = {
				bucketName: STORAGE_BUCKET,
				objectName: folder ? `${folder}/${file.name}` : file.name,
				contentType: file.type,
			};

			file.meta = {
				...file.meta,
				...supabaseMetadata,
			};

			console.log('file added', file);
			return getFiles();
		});

		uppy.on('upload-error', (file, error) => {
			console.log('upload error', error);

			toast({
				title: 'Error',
				description: 'Upload error, file already existed',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		});
		uppy.on('complete', (result) => {
			console.log(
				'Upload complete! We’ve uploaded these files:',
				result.successful,
			);
			getFiles();
		});
		uppy.on('upload-success', (props) => {
			console.log('upload success', props);
		});
	}, []);

	const handleUpdateTaskName = async (event: any) => {
		setIsEditingTaskName(false);
		if (event.target.value.length === 0) return;

		await updateTask(task.id, {
			...task,
			name: event.target.value,
		});
	};

	const handleUpdateTaskDescription = async (event: any) => {
		console.log('updating desc:', event.value);
		setisEditingTaskDescription(false);
		await updateTask(task.id, {
			...task,
			description: event.value,
		});
	};

	return (
		<Portal>
			<Modal
				onClose={onClose}
				size={'3xl'}
				isOpen={isOpen}
				scrollBehavior="outside"
			>
				<ModalOverlay />
				<Box visibility={isOpen ? 'visible' : 'hidden'}>
					<ModalContent pl="8px" mb="3.75rem" mt="3rem" background={'gray.50'}>
						{/* <Image
						objectFit={'cover'}
						maxH="150"
						background={'gray.200'}
						minH="100"
						borderTopRadius={'8px'}
					/> */}
						<ModalHeader>
							<Box ml="4px">
								{isEditingTaskName ? (
									<Box>
										<AutoResizeTextarea
											maxH="100%"
											overflow={'hidden'}
											defaultValue={task.name}
											maxLength={50}
											maxWidth={'95%'}
											// focusBorderColor="none"
											onBlur={handleUpdateTaskName}
											onFocus={(event: any) => {
												event.target.selectionEnd = event.target.value.length;
											}}
											onKeyDown={(event: any) => {
												if (event.key === 'Enter') {
													handleUpdateTaskName(event);
												}
												if (event.key === 'Escape') {
													setIsEditingTaskName(false);
												}
											}}
											autoFocus
											bgColor="white"
											fontSize={'xl'}
										/>
									</Box>
								) : (
									<Heading
										border={'none'}
										p={1}
										onClick={() => {
											setIsEditingTaskName(true);
										}}
										cursor={'pointer'}
										textOverflow="ellipsis"
										overflow={'hidden'}
										size="md"
										maxW={'100%'}
										// whiteSpace={'nowrap'}
									>
										{task.name}
									</Heading>
								)}
							</Box>
						</ModalHeader>
						<ModalCloseButton />

						<ModalBody>
							<Flex
								justifyContent={{ base: 'space-evenly', md: 'space-between' }}
								flexDirection={{ base: 'column', md: 'row' }}
								my="4px"
							>
								<Box m="10px" width={{ base: '100%', md: '75%' }}>
									<Flex justifyContent={'space-between'} alignItems={'center'}>
										<Icon as={FaAlignLeft} position="absolute" left="4" />
										<Heading fontSize={'lg'} my="8px">
											Description
										</Heading>
										{task.description && (
											<Button
												size={'sm'}
												onClick={() => {
													setisEditingTaskDescription(true);
												}}
											>
												Edit
											</Button>
										)}
									</Flex>
									{isEditingTaskDescription ? (
										<Box>
											<AutoResizeTextarea
												ref={taskDescriptionRef}
												overflow={'hidden'}
												defaultValue={task.description}
												minH="100px"
												maxLength={255}
												maxWidth={'100%'}
												// focusBorderColor="none"
												onFocus={(event: any) => {
													event.target.selectionEnd = event.target.value.length;
												}}
												onKeyDown={(event: any) => {
													if (event.key === 'Escape') {
														setisEditingTaskDescription(false);
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
													onClick={() =>
														handleUpdateTaskDescription(
															taskDescriptionRef.current,
														)
													}
												>
													Save
												</Button>
												<Button
													variant="ghost"
													size={'sm'}
													onClick={() => {
														setisEditingTaskDescription(false);
													}}
												>
													Cancel
												</Button>
											</HStack>
										</Box>
									) : (
										<>
											{!task.description && (
												<Button
													width={'100%'}
													height="60px"
													p="4"
													onClick={() => {
														setisEditingTaskDescription(true);
													}}
													justifyContent={'left'}
													alignItems={'baseline'}
												>
													Add new description...
												</Button>
											)}
											<Text
												border={'none'}
												onClick={() => {
													setisEditingTaskDescription(true);
												}}
												cursor={'pointer'}
												textOverflow="ellipsis"
												overflow={'hidden'}
												maxW={'100%'}
											>
												{task.description}
											</Text>
										</>
									)}
									<Flex
										justifyContent={'space-between'}
										alignItems={'center'}
										my="4"
									>
										<Icon as={FaPaperclip} position="absolute" left="4" />
										<Heading fontSize={'lg'} my="8px">
											Attachments
										</Heading>
										<Button
											size={'sm'}
											onClick={() => {
												onOpenUppy();
											}}
										>
											Add
										</Button>
									</Flex>
									<Box>
										{files.map((file: any) => {
											return (
												<AttachmentCard
													file={file}
													onDeleteFile={() => deleteFile(file)}
													key={file.id}
												/>
											);
										})}
									</Box>
								</Box>
								<VStack alignItems={'left'}>
									<Heading as="h3" fontSize={'14'}>
										Add to card
									</Heading>
									<Button
										justifyContent={'left'}
										size="sm"
										width={'150px'}
										leftIcon={<AddIcon />}
									>
										Long long button
									</Button>
									<Button
										justifyContent={'left'}
										size="sm"
										width={'150px'}
										leftIcon={<AddIcon />}
									>
										button
									</Button>

									<Button
										justifyContent={'left'}
										size="sm"
										width={'150px'}
										leftIcon={<AddIcon />}
									>
										Lobutton
									</Button>

									<Button
										justifyContent={'left'}
										size="sm"
										width={'150px'}
										leftIcon={<AddIcon />}
									>
										on
									</Button>
								</VStack>
							</Flex>

							<DashboardModal
								uppy={uppy}
								proudlyDisplayPoweredByUppy={false}
								open={isOpenUppy}
								onRequestClose={() => {
									uppy.cancelAll();
									onCloseUppy();
								}}
								closeModalOnClickOutside={true}
								note={'Upload up to 5 files, maximum 4 MB each'}
							/>
						</ModalBody>
						<ModalFooter>
							{/* <Button onClick={onClose}>Close</Button> */}
						</ModalFooter>
					</ModalContent>
				</Box>
			</Modal>
		</Portal>
	);
}
