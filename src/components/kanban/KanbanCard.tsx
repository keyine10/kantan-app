import {
	Box,
	IconButton,
	Textarea,
	Card,
	CardHeader,
	CardBody,
} from '@chakra-ui/react';
import { KanbanTaskModel } from '../../types/kanban-task';
import { HamburgerIcon } from '@chakra-ui/icons';
export default function KanbanCard({ task }: { task: KanbanTaskModel }) {
	return (
		<Card
			as="div"
			role="group"
			position="relative"
			rounded={'lg'}
			minW={272}
			bgColor={'yellow.400'}
			cursor={'grab'}
		>
			<IconButton
				position={'absolute'}
				aria-label="options"
				top={0}
				right={0}
				zIndex={100}
				size="md"
				opacity={0.7}
				_hover={{ opacity: 1 }}
				variant="ghost"
				colorScheme="gray"
				icon={<HamburgerIcon />}
			/>
			<CardBody>
				<Textarea
					value={task.name}
					border={'none'}
					cursor={'inherit'}
					p={0}
					minH={70}
					maxH={200}
					focusBorderColor="none"
					resize={'none'}
				/>
			</CardBody>
		</Card>
	);
}
