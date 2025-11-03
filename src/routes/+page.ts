import { createClient } from '@supabase/supabase-js';
import type { PageLoad } from './$types';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL!, PUBLIC_SUPABASE_ANON_KEY!);

export const load: PageLoad = async () => {
	const { data: articles, error } = await supabase
		.from('articles')
		.select('*')
		.order('published_at', { ascending: false })
		.limit(20);

	if (error) {
		console.error('Error fetching articles:', error);
		return { articles: [] };
	}

	return { articles };
};
