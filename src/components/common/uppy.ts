import Compressor from '@uppy/compressor';
import Uppy from '@uppy/core';
import ScreenCapture from '@uppy/screen-capture';
import Tus from '@uppy/tus';

const supabaseStorageURL = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;
const anonKey = `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

export const uppy = new Uppy({
	locale: {
		strings: {
			dropPasteImportFiles: 'Drop files here, or browse from:',
		},
	},
	restrictions: {
		maxFileSize: 4 * 1024 * 1024,
		maxNumberOfFiles: 1,
		minNumberOfFiles: 1,
		allowedFileTypes: null,
	},
})
	.use(Tus, {
		endpoint: supabaseStorageURL,
		headers: {
			authorization: `Bearer ${anonKey}`,
			apikey: anonKey,
		},
		chunkSize: 4 * 1024 * 1024,
		allowedMetaFields: [
			'bucketName',
			'objectName',
			'contentType',
			'cacheControl',
		],
	})
	.use(Compressor);
