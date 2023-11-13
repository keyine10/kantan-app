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
	Input,
	Flex,
	Box,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import tinycolor from 'tinycolor2';

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
const defaultColor = '#555555';
export function ColorPickerWrapper({
	variant = 'default',
	tag,

	handleUpdateBackgroundColor = () => {},
	handleRemoveBackgroundColor = () => {},
	handleCreateTag = () => {},
	handleUpdateTag = () => {},
	handleDeleteTag = () => {},
	initialColor,
	children,
	closeOnBlur = true,
}: any) {
	const [color, setColor] = useState(
		initialColor ? initialColor : defaultColor,
	);
	const [tagName, setTagName] = useState(tag ? tag?.name : '');
	const { isOpen, onOpen, onClose } = useDisclosure();
	const handleSaveTag = () => {
		console.log('saving tag');
		if (!tag) {
			if (tagName) {
				console.log('creating tag', tagName, color);

				handleCreateTag({ name: tagName, backgroundColor: color });
			}
		} else if (tagName !== tag.name || color !== tag.backgroundColor)
			handleUpdateTag({
				id: tag.id,
				name: tagName ? tagName : tag.name,
				backgroundColor: color,
			});
	};
	// useEffect(() => {
	// 	// console.log('running every time');
	// 	if (tag) {
	// 		setColor(tag.backgroundColor);
	// 		setTagName(tag.name);
	// 	}
	// });
	const onOpenPicker = () => {
		setTagName(tag ? tag.name : '');
		setColor(initialColor ? initialColor : defaultColor);
		onOpen();
	};

	const onClosePicker = () => {
		onClose();
		if (!tag) {
			setTagName('');
			setColor(defaultColor);
		}
	};
	return (
		<Popover
			variant="picker"
			isLazy
			onClose={onClosePicker}
			closeOnBlur={closeOnBlur}
			isOpen={isOpen}
			onOpen={onOpenPicker}
		>
			<PopoverTrigger>
				<div onClick={onOpenPicker}>{children}</div>
			</PopoverTrigger>
			<PopoverContent width="200px">
				<PopoverCloseButton
					color={tinycolor(color).getLuminance() < 0.5 ? 'white' : 'black'}
					onClick={onClosePicker}
				/>
				<PopoverHeader
					height="50px"
					backgroundColor={color}
					borderTopLeftRadius={5}
					borderTopRightRadius={5}
					color="white"
				></PopoverHeader>
				<PopoverBody height="100%">
					<SimpleGrid columns={5} spacing={1.5}>
						{colors.map((c) => (
							<Button
								key={c}
								aria-label={c}
								background={c}
								height="1.5rem"
								width="100%"
								padding={0}
								minWidth="unset"
								borderRadius={3}
								_hover={{ background: c }}
								onClick={() => {
									setColor(c);
									if (variant !== 'tag') handleUpdateBackgroundColor(c);
								}}
							></Button>
						))}
					</SimpleGrid>
					{variant === 'tag' && (
						<Input
							borderRadius={3}
							marginTop={3}
							maxLength={50}
							defaultValue={tagName}
							size="sm"
							onChange={(e) => {
								setTagName(e.target.value);
							}}
						/>
					)}
					<Button
						size="sm"
						width={'100%'}
						variant={'outline'}
						onClick={() => {
							handleRemoveBackgroundColor();
							// handleUpdateBackgroundColor(defaultColor);
							setColor(defaultColor);
						}}
						my={2}
					>
						Remove Background
					</Button>
				</PopoverBody>
				{variant === 'tag' && (
					<PopoverFooter>
						<Flex justifyContent={'space-between'}>
							<Button
								size="sm"
								variant={'solid'}
								colorScheme="blue"
								type="submit"
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									handleSaveTag();
									onClosePicker();
								}}
							>
								Save
							</Button>
							{tag && (
								<Button
									colorScheme="red"
									size="sm"
									variant={'solid'}
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										handleDeleteTag();
										onClosePicker();
									}}
								>
									Delete
								</Button>
							)}
						</Flex>
					</PopoverFooter>
				)}
			</PopoverContent>
		</Popover>
	);
}
