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
	Portal,
	Image,
	Link,
	useToast,
	Heading,
} from '@chakra-ui/react';

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
	const folder = task.id;
	useEffect(() => {
		getFiles();
	}, []);
	async function getFiles() {
		const { data, error } = await supabase.storage
			.from('dump')
			.list('temporary folder');
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
			getFiles();
		});

		uppy.on('upload-error', (file, error) => {
			console.log('upload error', file, error);
		});
		uppy.on('complete', (result) => {
			console.log(
				'Upload complete! We’ve uploaded these files:',
				result.successful,
			);
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
				size={'xl'}
				isOpen={isOpen}
				scrollBehavior="outside"
			>
				<ModalOverlay />

				<ModalContent>
					<Image
						objectFit={'cover'}
						maxH="150"
						background={'gray.200'}
						minH="100"
						borderTopRadius={'8px'}
					/>
					<ModalHeader>
						{isEditingTaskName ? (
							<Box>
								<AutoResizeTextarea
									maxH="100%"
									overflow={'hidden'}
									defaultValue={task.name}
									maxLength={50}
									maxWidth={'100%'}
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
					</ModalHeader>
					<ModalCloseButton />

					<ModalBody>
						<Box my="8px">
							<Flex justifyContent={'space-between'}>
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
												handleUpdateTaskDescription(taskDescriptionRef.current)
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
											height="50px"
											onClick={() => {
												setisEditingTaskDescription(true);
											}}
											textAlign={'left'}
										>
											Add new description
										</Button>
									)}
									<Text
										border={'none'}
										p={1}
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
						</Box>

						<Button onClick={onOpenUppy}>Upload</Button>
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
						{files.map((file: any) => {
							return (
								<div>
									<Link
										href={getPublicURL(
											'dump',
											'temporary folder' + '/' + file.name,
										)}
										isExternal
									>
										{file.name}
										{file.metadata?.mimetype?.includes('image') ? (
											<Image
												src={getPublicURL(
													'dump',
													'temporary folder' + '/' + file.name,
												)}
												objectFit={'cover'}
												width={150}
												height={150}
											/>
										) : (
											<></>
										)}
									</Link>
									<Button onClick={() => deleteFile(file)}>Delete</Button>
								</div>
							);
						})}
					</ModalBody>
					<ModalFooter>
						{/* <Button onClick={onClose}>Close</Button> */}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Portal>
	);
}
