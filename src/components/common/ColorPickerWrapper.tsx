import {
	Box,
	ChakraProvider,
	Popover,
	PopoverTrigger,
	Button,
	PopoverContent,
	PopoverArrow,
	PopoverCloseButton,
	PopoverHeader,
	PopoverBody,
	Center,
	SimpleGrid,
	extendTheme,
	Input,
	Heading,
	PopoverFooter,
} from '@chakra-ui/react';
import { useState } from 'react';

const colors = [
	'gray.500',
	'red.500',
	'gray.700',
	'green.500',
	'blue.500',
	'blue.800',
	'yellow.500',
	'orange.500',
	'purple.500',
	'pink.500',
	'teal.300',
	'blue.200',
	'pink.200',
	'yellow.200',
	'orange.300',
];
export function ColorPickerWrapper({
	handleUpdateBackgroundColor,
	handleRemoveBackgroundColor,
	initialColor,
	children,
}: any) {
	const [color, setColor] = useState(initialColor ? initialColor : 'gray.500');

	return (
		<Popover variant="picker">
			<PopoverTrigger>{children}</PopoverTrigger>
			<PopoverContent width="170px">
				<PopoverArrow bg={color} />
				<PopoverCloseButton color="white" />
				<PopoverHeader
					height="50px"
					backgroundColor={color}
					borderTopLeftRadius={5}
					borderTopRightRadius={5}
					color="white"
				></PopoverHeader>
				<PopoverBody height="100%">
					<SimpleGrid columns={5} spacing={2}>
						{colors.map((c) => (
							<Button
								key={c}
								aria-label={c}
								background={c}
								height="22px"
								width="22px"
								padding={0}
								minWidth="unset"
								borderRadius={3}
								_hover={{ background: c }}
								onClick={() => {
									setColor(c);
									handleUpdateBackgroundColor(c);
								}}
							></Button>
						))}
					</SimpleGrid>
					{/* <Input
						borderRadius={3}
						marginTop={3}
						placeholder="red.100"
						size="sm"
						value={color}
						onChange={(e) => {
							setColor(e.target.value);
							onPicked(e.target.value);
						}}
					/> */}
				</PopoverBody>
				<PopoverFooter>
					<Button
						size="sm"
						width={'100%'}
						variant={'outline'}
						onClick={() => {
							handleRemoveBackgroundColor();
							setColor('gray.500');
						}}
					>
						Remove
					</Button>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
}
