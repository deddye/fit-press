export type Article = {
	id: string;
	url: string;
	title: string;
	summary: string | null;
	published_at: string | null;
	fetched_at: string;
	source_type: string;
	image_url: string | null;
	category: string;
	reading_time: number | null;
};
