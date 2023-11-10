import {
	Popover,
	PopoverTrigger,
	Button,
	PopoverContent,
	PopoverCloseButton,
	PopoverHeader,
	PopoverBody,
	SimpleGrid,
	PopoverFooter,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';

const colors = [
	'#E2E8F0',
	'#CBD5E0',
	'#A0AEC0',
	'#2D3748',
	'#FC8181',
	'#E53E3E',
	'#63171B',
	'#FBD38D',
	'#C05621',
	'#FAF089',
	'#F6E05E',
	'#68D391',
	'#38A169',
	'#38B2AC',
	'#90CDF4',
	'#065666',
	'#FBB6CE',
	'#FFF5F7',
	'#000000',
	'#1C4532',
];
export function ColorPickerWrapper({
	handleUpdateBackgroundColor,
	handleRemoveBackgroundColor,
	initialColor,
	children,
	closeOnBlur = true,
}: any) {
	const [color, setColor] = useState(initialColor ? initialColor : 'gray.500');
	return (
		<Popover variant="picker" closeOnBlur={closeOnBlur}>
			<PopoverTrigger>{children}</PopoverTrigger>
			<PopoverContent width="170px">
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
						onChange={(e) => {
							setColor(e.target.value);
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
							setColor('gray.200');
						}}
					>
						Remove
					</Button>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
}
