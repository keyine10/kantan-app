export default function supabaseLoader({
	src,
	width,
	quality,
}: {
	src: string;
	width: number;
	quality?: number;
}) {
	const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
	return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${
		quality || 75
	}`;
}
