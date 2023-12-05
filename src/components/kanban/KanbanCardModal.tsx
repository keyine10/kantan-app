import {
	AddIcon,
	ChevronDownIcon,
	DeleteIcon,
	InfoIcon,
} from '@chakra-ui/icons';
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
	Tag,
	TagCloseButton,
	TagLabel,
	Wrap,
	WrapItem,
	TagRightIcon,
} from '@chakra-ui/react';

import { FaAlignLeft, FaFile, FaImage, FaPaperclip } from 'react-icons/fa6';
import tinycolor from 'tinycolor2';

import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import ScreenCapture from '@uppy/screen-capture';

import Compressor from '@uppy/compressor';

import ImageEditor from '@uppy/image-editor';
import { DashboardModal } from '@uppy/react';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/screen-capture/dist/style.min.css';
import '@uppy/image-editor/dist/style.min.css';

import { supabase } from '../common/supabaseClient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';
import { taskService } from '../../services/task.service';
import { useSession } from 'next-auth/react';
import { ColorPickerWrapper } from '../common/ColorPickerWrapper';
import { ConfirmModalWrapper } from '../common/ConfirmModalWrapper';

const STORAGE_BUCKET = 'attachment';
const supabaseStorageURL = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;
const anonKey = `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;
const getPublicURL = (path: string) => {
	return `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
};

function AttachmentCard({
	file,
	onDeleteFile,
	handleSetAttachmentAsBackground,
	isBackground,
	handleRemoveBackgroundColor,
}: any) {
	let imageSrc = file.mimetype?.includes('image')
		? getPublicURL(file.path)
		: '';

	return (
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
			<Link
				href={getPublicURL(file.path)}
				isExternal
				_hover={{
					textDecor: 'unset',
				}}
			>
				<Box h={'100%'}>
					{imageSrc ? (
						<Image
							objectFit="cover"
							src={imageSrc}
							alt={file.name}
							h={'100%'}
							width={'120px'}
							maxH={'100px'}
						/>
					) : (
						<Icon
							as={FaFile}
							width={'120px'}
							h={'100px'}
							opacity={0.5}
							bgColor={'gray.100'}
						/>
					)}
				</Box>
			</Link>
			<Stack>
				<Link
					href={getPublicURL(file.path)}
					isExternal
					_hover={{
						textDecor: 'unset',
					}}
				>
					<CardBody>
						<Heading size="sm">{file.name}</Heading>
					</CardBody>
				</Link>
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
						{file.mimetype?.includes('image') && !isBackground && (
							<Button
								variant={'link'}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									handleSetAttachmentAsBackground(file.path);
								}}
							>
								Set as thumbnail
							</Button>
						)}

						{isBackground && (
							<Button
								variant={'link'}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									handleRemoveBackgroundColor();
								}}
							>
								Remove thumbnail
							</Button>
						)}

						<Button variant={'link'}>
							<Link
								href={getPublicURL(file.path) + '?download='}
								download={'true'}
							>
								Download
							</Link>
						</Button>
					</Stack>
				</CardFooter>
			</Stack>
		</Card>
	);
}

export function KanbanCardModal({
	isOpen,
	onClose,
	task,
	updateTask,
	handleDeleteTask,
}: any) {
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
	const folder = task.boardId + '/' + task.listId + '/' + task.id;
	const { data: session, status } = useSession();

	let backgroundColor = task.backgroundColor;
	if (!task.backgroundColor) {
		backgroundColor = 'gray.100';
	}
	useEffect(() => {
		if (!isOpen) onCloseUppy();
	}, [isOpen, onCloseUppy]);
	async function getFiles() {
		const { data, error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.list(folder);
		if (error) return;
		setFiles(data);
	}
	async function deleteFile(file: any) {
		const { data, error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.remove([file.path]);
		if (data) {
			setFiles((prevFiles: any) =>
				prevFiles.filter((f: any) => f.name !== file.name),
			);
			try {
				await taskService.removeAttachment(
					task.id,
					file.id,
					session?.user.accessToken,
				);
			} catch (error) {
				console.log(error);
			}
		}
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

	const uppy = useMemo(
		() =>
			new Uppy({
				id: task.id,
				meta: {
					id: task.id,
				},
				locale: {
					strings: {
						dropPasteImportFiles: 'Drop files here, or browse from:',
						dropPasteFiles: 'Drop file here or %{browseFiles}',
						browseFiles: 'browse file',
					},
				},
				restrictions: {
					maxFileSize: 4 * 1024 * 1024,
					minFileSize: 1,
					maxNumberOfFiles: 1,
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
					allowedMetaFields: [
						'bucketName',
						'objectName',
						'contentType',
						'cacheControl',
					],
					onShouldRetry(err: any, retryAttempt, options, next) {
						console.log('onshouldretry', err?.originalResponse?.getStatus());
						if (err?.originalResponse?.getStatus() === 409) {
							toast({
								title: 'Error',
								description: 'Upload error, file already existed',
								status: 'error',
								duration: 5000,
								isClosable: true,
							});
							return false;
						}
						return next(err);
					},
				})
				.use(Compressor, {
					id: task.id,
					quality: 0.6,
					convertTypes: ['image/png', 'image/webp'],
					convertSize: 1 * 1024 * 1024,
				} as any),
		[],
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
		});

		uppy.on('upload-error', (file, error) => {
			console.log('upload error', error);
		});
		uppy.on('complete', (result) => {
			console.log(
				'Upload complete! We’ve uploaded these files onto card, ',
				task.id,
				result.successful,
			);
			// getFiles();
		});
		uppy.on('upload-success', async (props: any) => {
			console.log('upload success', props);
			try {
				console.log('uploading to backend database');
				await taskService.addAttachment(
					task.id,
					{
						name: props.meta.name,
						size: props.size,
						mimetype: props.type,
						// path: folder ? `${folder}/${props.meta.name}` : props.meta.name,
						path: props.meta.objectName,
					},
					session?.user.accessToken,
				);
			} catch (e) {
				console.log('upload to backend error', e);
			}
		});
		return () => {
			uppy.close();
		};
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

	const handleSetAttachmentAsBackground = async (path: string) => {
		console.log('setting attachment as background', path);
		await updateTask(task.id, {
			...task,
			backgroundColor: null,
			backgroundAttachmentPath: path,
		});
	};
	const handleUpdateBackgroundColor = async (color: string) => {
		await updateTask(task.id, {
			...task,
			backgroundColor: color,
			backgroundAttachmentPath: null,
		});
	};

	const handleRemoveBackgroundColor = async () => {
		await updateTask(task.id, {
			...task,
			backgroundColor: null,
			backgroundAttachmentPath: null,
		});
	};

	const handleCreateTag = async ({
		name,
		backgroundColor,
	}: {
		name: string;
		backgroundColor: string;
	}) => {
		try {
			console.log('creating tag', name, backgroundColor);

			await taskService.addTag(
				task.id,
				{ name: name, backgroundColor: backgroundColor },
				session?.user.accessToken,
			);
		} catch (e) {
			console.log('error creating tag', e);

			toast({
				title: 'Error',
				description: 'Could not create tag, please try again',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
	};
	const handleUpdateTag = async (tag: any) => {
		console.log('updating tag', tag);
		try {
			await taskService.updateTag(task.id, tag, session?.user.accessToken);
		} catch (e) {
			console.log('error updating tag', e);
			toast({
				title: 'Error',
				description: 'Could not update tag, please try again',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
	};
	const handleDeleteTag = async (tag: any) => {
		console.log('deleting tag', tag);
		try {
			await taskService.removeTag(task.id, tag.id, session?.user.accessToken);
		} catch (e) {
			console.log('error deleting tag', e);
			toast({
				title: 'Error',
				description: 'Could not delete tag, please try again',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
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
					<ModalContent
						mb="3.75rem"
						mt="3rem"
						background={'gray.50'}
						borderRadius={'lg'}
					>
						{task.backgroundColor && (
							<Box
								objectFit={'cover'}
								maxH="150"
								background={task.backgroundColor}
								minH="100"
								borderTopRadius={'8px'}
							/>
						)}
						{task.backgroundAttachmentPath && (
							<Box
								objectFit={'cover'}
								maxH="150"
								minH="100"
								borderTopRadius={'8px'}
								background={'gray.100'}
							>
								<Image
									objectFit="cover"
									src={getPublicURL(task.backgroundAttachmentPath)}
									alt={'background'}
									maxH={'150px'}
									w={'100%'}
									borderTopRadius={'8px'}
								/>
							</Box>
						)}
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
						<ModalCloseButton
							color={
								task.backgroundColor
									? tinycolor(backgroundColor).getLuminance() < 0.5
										? 'white'
										: 'black'
									: 'black'
							}
						/>

						<ModalBody>
							<Flex
								justifyContent={{ base: 'space-evenly', md: 'space-between' }}
								flexDirection={{ base: 'column', md: 'row' }}
								mb="4px"
							>
								<Box m="10px" width={{ base: '100%', md: '75%' }}>
									<Box>
										<Wrap>
											{task.tags.map((tag: any) => (
												<WrapItem key={tag.id}>
													<ColorPickerWrapper
														variant="tag"
														tag={tag}
														handleDeleteTag={() => handleDeleteTag(tag)}
														handleUpdateTag={handleUpdateTag}
														initialColor={tag.backgroundColor}
													>
														<Tag
															size={'md'}
															border="2px solid transparent"
															key={tag.id}
															variant="solid"
															backgroundColor={tag.backgroundColor}
															color={
																tinycolor(tag.backgroundColor).getLuminance() <
																0.5
																	? 'white'
																	: 'black'
															}
															_hover={{
																border: '2px solid black',
																backgroundColor: tinycolor(tag.backgroundColor)
																	.lighten(5)
																	.toHexString(),
															}}
															cursor={'pointer'}
														>
															<TagLabel>{tag.name}</TagLabel>
															<TagCloseButton
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteTag(tag);
																}}
															/>
														</Tag>
													</ColorPickerWrapper>
												</WrapItem>
											))}
											<WrapItem>
												<ColorPickerWrapper
													variant="tag"
													handleCreateTag={handleCreateTag}
												>
													{/* <Button
														size="xs"
														variant="solid"
														colorScheme="green"
														aria-label="Add label"
														rightIcon={<AddIcon />}
													>
														New label
													</Button> */}
													<Tag
														cursor={'pointer'}
														background={'gray.200'}
														_hover={{ backgroundColor: 'gray.300' }}
													>
														<TagLabel>New tag</TagLabel>
														<TagRightIcon as={AddIcon} />
													</Tag>
												</ColorPickerWrapper>
											</WrapItem>
										</Wrap>
									</Box>
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
												if (task.attachments?.length < 5) onOpenUppy();
												else
													toast({
														title: 'Maximum 5 files',
														status: 'info',
														duration: 5000,
														isClosable: true,
													});
											}}
										>
											Add
										</Button>
									</Flex>
									<Box>
										{task.attachments &&
											task.attachments.map((file: any) => {
												return (
													<AttachmentCard
														file={file}
														folder={folder}
														onDeleteFile={() => deleteFile(file)}
														key={file.id}
														handleSetAttachmentAsBackground={
															handleSetAttachmentAsBackground
														}
														isBackground={
															task.backgroundAttachmentPath === file.path
																? true
																: false
														}
														handleRemoveBackgroundColor={
															handleRemoveBackgroundColor
														}
													/>
												);
											})}
									</Box>
								</Box>
								<VStack alignItems={'left'}>
									<Heading as="h3" fontSize={'14'}>
										Actions
									</Heading>

									<ColorPickerWrapper
										variant="tag"
										handleCreateTag={handleCreateTag}
										handleDeleteTag={handleDeleteTag}
									>
										<Button
											justifyContent={'left'}
											size="sm"
											width={'160px'}
											leftIcon={<AddIcon />}
										>
											Tag
										</Button>
									</ColorPickerWrapper>

									<ColorPickerWrapper
										handleUpdateBackgroundColor={handleUpdateBackgroundColor}
										handleRemoveBackgroundColor={handleRemoveBackgroundColor}
										initialColor={task?.backgroundColor}
									>
										<Button
											justifyContent={'left'}
											size="sm"
											width={'160px'}
											leftIcon={<FaImage />}
										>
											Background
										</Button>
									</ColorPickerWrapper>

									<Button
										justifyContent={'left'}
										size="sm"
										width={'160px'}
										leftIcon={<DeleteIcon />}
										onClick={() => {
											handleRemoveBackgroundColor();
										}}
									>
										Delete Background
									</Button>

									<ConfirmModalWrapper
										label={'Task'}
										onDelete={handleDeleteTask}
									>
										<Button
											justifyContent={'left'}
											size="sm"
											width={'160px'}
											leftIcon={<DeleteIcon />}
										>
											Delete Task
										</Button>
									</ConfirmModalWrapper>
								</VStack>
							</Flex>

							<DashboardModal
								uppy={uppy}
								proudlyDisplayPoweredByUppy={false}
								open={isOpenUppy}
								onRequestClose={() => {
									uppy.resetProgress();
									uppy.cancelAll();
									onCloseUppy();
								}}
								// closeModalOnClickOutside={true}
								closeAfterFinish={true}
								note={
									`Maximum ${5 - task.attachments?.length} files, 4 MB each. ` +
									`Images will be converted to JPG`
								}
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
