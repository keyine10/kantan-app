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
} from '@chakra-ui/react';

import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import ScreenCapture from '@uppy/screen-capture';

import Compressor from '@uppy/compressor';
import { DashboardModal } from '@uppy/react';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/screen-capture/dist/style.min.css';

import { useEffect, useState } from 'react';

const STORAGE_BUCKET = 'dump';

const supabaseStorageURL = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;
const anonKey = `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

export function KanbanCardModal({ isOpen, onClose, task }: any) {
	const {
		onOpen: onOpenUppy,
		onClose: onCloseUppy,
		isOpen: isOpenUppy,
	} = useDisclosure();
	const folder = task.id;

	const [uppy] = useState(() =>
		new Uppy({
			locale: {
				strings: {
					dropPasteImportFiles: 'Drop files here, or browse from:',
				},
			},
			restrictions: {
				maxFileSize: 8 * 1024 * 1024,
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

	return (
		<Portal>
			<Modal
				onClose={onClose}
				size={'3xl'}
				isOpen={isOpen}
				isCentered
				scrollBehavior="inside"
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
					<ModalHeader>{task.name}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text>
							Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque
							explicabo distinctio iure temporibus nulla tempore, consectetur
							aspernatur perferendis reprehenderit nihil? Vero id asperiores
							earum, iste minus in adipisci magni commodi.
						</Text>

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
							note={'Upload up to 5 files, maximum 8 MB each'}
						/>
					</ModalBody>
					<ModalFooter>
						{/* <Button onClick={onClose}>Close</Button> */}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Portal>
	);
}
