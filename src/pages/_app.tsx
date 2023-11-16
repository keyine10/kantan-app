import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<SessionProvider session={session}>
			<ChakraProvider>{getLayout(<Component {...pageProps} />)}</ChakraProvider>
		</SessionProvider>
	);
}
