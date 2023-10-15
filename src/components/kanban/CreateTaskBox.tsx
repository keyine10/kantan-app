import { Box, Card, CardBody } from '@chakra-ui/react';
import { AutoResizeTextarea } from '../common/AutoResizeTextArea';

export default function CreateTaskBox({
	handleCreateTask,
	setIsCreatingNewTask,
}: any) {
	return (
		<Box
		// opacity={isDragging ? 1 : 0}
		>
			<Card
				as="div"
				position="relative"
				rounded={'lg'}
				minW={240}
				maxW={304}
				bgColor={'white'}
				boxShadow={
					'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;'
				}
			>
				<CardBody p={2} py={3}>
					<AutoResizeTextarea
						border={'none'}
						resize={'none'}
						defaultValue={''}
						// focusBorderColor="none"
						onBlur={handleCreateTask}
						onFocus={(event: any) => {
							event.target.selectionEnd = event.target.value.length;
						}}
						onKeyDown={(event: any) => {
							if (event.key === 'Enter') {
								handleCreateTask(event);
							}
							if (event.key === 'Escape') {
								setIsCreatingNewTask(false);
							}
						}}
						autoFocus
						bgColor="white"
						maxLength={50}
					/>
				</CardBody>
			</Card>
		</Box>
	);
}
