import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { PageServerLoad } from '../../$types';

const supabase = createClient(PUBLIC_SUPABASE_URL!, PUBLIC_SUPABASE_ANON_KEY!);

export const load: PageServerLoad = async ({ params }) => {
	const { category } = params as { category: string };

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
