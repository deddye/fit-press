import { createClient } from '@supabase/supabase-js';
import type { PageLoad } from './$types';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL!, PUBLIC_SUPABASE_ANON_KEY!);

export const load: PageLoad = async ({ params }) => {
	const { category } = params;

	const { data: articles, error } = await supabase
		.from('articles')
		.select('*')
		.eq('category', category)
		.order('published_at', { ascending: false })
		.limit(15);

	if (error) console.error('Error fetching category articles:', error);

	return {
		category,
		articles: articles ?? []
	};
};
