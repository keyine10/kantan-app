import React, { PropsWithChildren } from 'react';
import Navbar from '../common/Navbar';
const LayoutWithNavBar = ({ children, ...props }: any) => {
	return (
		<>
			<Navbar {...props} />
			{children}
		</>
	);
};
export default LayoutWithNavBar;
