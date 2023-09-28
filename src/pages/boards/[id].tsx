import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import LayoutWithNavBar from '../../components/layout/LayoutWithNavBar';

export default function KanbanPage() {
	const router = useRouter();
	return <KanbanBoard />;
}

KanbanPage.getLayout = function getLayout(page: ReactElement) {
	return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
