import {
	Alert,
	AlertIcon,
	AlertTitle,
	Button,
	FormControl,
	FormLabel,
	Input,
	Stack,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import error from 'next/error';

export default function Test() {
	const formik = useFormik({
		initialValues: {
			title: '',
			description: '',
		},
		onSubmit: async (values) => {
			console.log(formik.isSubmitting);
		},
	});
	return (
		<div>
			<form onSubmit={formik.handleSubmit}>
				<FormControl>
					<Stack spacing="6">
						<div>
							<FormLabel htmlFor="email">Email</FormLabel>
							<Input
								id="email"
								name="email"
								type="email"
								onChange={formik.handleChange}
							/>
						</div>

						<Button
							colorScheme="purple"
							type="submit"
							isLoading={formik.isSubmitting}
						>
							Sign in
						</Button>
					</Stack>
				</FormControl>
			</form>
		</div>
	);
}
