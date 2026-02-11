export type Article = {
	id: string; // or number if your DB uses serial integers
	url: string;
	title: string;
	summary: string | null;
	published_at: string | null; // ISO string from DB
	fetched_at: string; // ISO string
	source_type: string; // consider narrowing later
	image_url: string | null;
	category: string;
};
