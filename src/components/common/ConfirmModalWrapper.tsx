import {
	useDisclosure,
	Button,
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
} from '@chakra-ui/react';
import { useRef, Children, cloneElement } from 'react';

export function ConfirmModalWrapper({ label, onDelete, children }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = useRef<any>();
	return (
		<div>
			{/* <Button colorScheme="red" onClick={onOpen}>
				Delete
			</Button> */}
			<div onClick={onOpen}>{children}</div>
			<AlertDialog
				isOpen={isOpen}
				leastDestructiveRef={cancelRef}
				onClose={onClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete {label}
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure? You can't undo this action afterwards.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									onDelete();
									onClose();
								}}
								ml={3}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</div>
	);
}
