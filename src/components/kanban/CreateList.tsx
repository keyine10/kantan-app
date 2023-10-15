import { Flex, Heading, Box } from '@chakra-ui/react';

import { AutoResizeTextarea } from '../common/AutoResizeTextArea';

export default function CreateList({
	handleCreateList,
	setIsCreatingList,
}: any) {
	return (
		<Box
			maxH={{ base: '94vh', xl: '93vh' }}
			rounded={'lg'}
			bgColor={'gray.50'}
			minWidth={'280px'}
			maxWidth={'304px'}
			zIndex={100}
			p={2}
		>
			<AutoResizeTextarea
				border={'none'}
				fontSize={16}
				resize={'none'}
				defaultValue={''}
				// focusBorderColor="none"
				onBlur={handleCreateList}
				onFocus={(event: any) => {
					event.target.selectionEnd = event.target.value.length;
				}}
				onKeyDown={(event: any) => {
					if (event.key === 'Enter') {
						handleCreateList(event);
						setIsCreatingList(false);
					}
					if (event.key === 'Escape') {
						setIsCreatingList(false);
					}
				}}
				autoFocus
				size="sm"
				bgColor="white"
				minW={240}
			/>
		</Box>
	);
}
