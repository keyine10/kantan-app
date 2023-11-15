import React, { PropsWithChildren } from 'react';
import Navbar from '../common/Navbar';
import { Box } from '@chakra-ui/layout';
const LayoutWithNavBar = ({ children, ...props }: any) => {
	return (
		<Box>
			<Navbar {...props} />
			{children}
		</Box>
	);
};
export default LayoutWithNavBar;
