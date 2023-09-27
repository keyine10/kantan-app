import React, { PropsWithChildren } from 'react';
import Navbar from '../common/Navbar';
const LayoutWithNavBar = ({ children }: PropsWithChildren) => {
	return (
		<>
			<Navbar />
			{children}
		</>
	);
};
export default LayoutWithNavBar;
