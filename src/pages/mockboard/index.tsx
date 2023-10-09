import { ReactElement } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';

export default function MockBoard() {
	// return <KanbanBoard />;
	return;
}
MockBoard.getLayout = function getLayout(page: ReactElement) {
	return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
