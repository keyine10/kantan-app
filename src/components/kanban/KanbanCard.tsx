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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
export default function KanbanCard({ task }: { task: KanbanTaskModel }) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	return (
		<Card
			as="div"
			position="relative"
			rounded={'lg'}
			minW={272}
			bgColor={'gray.100'}
			cursor={'grab'}
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			zIndex={100}
			key={task.id}
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
					defaultValue={task.name}
					border={'none'}
					cursor={'inherit'}
					p={0}
					minH={'unset'}
					maxH={200}
					resize={'none'}
					_focusVisible={{
						outline: 'none',
						bg: 'white.300',
					}}
				/>
			</CardBody>
		</Card>
	);
}
