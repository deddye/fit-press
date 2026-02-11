import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import crypto from 'crypto';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const load: PageServerLoad = async () => {
	const { data: articles, error } = await supabase
		.from('articles')
		.select('*')
		.order('published_at', { ascending: false })
		.limit(30);

	if (error) {
		console.error('Error fetching articles:', error);
		return { articles: [] };
	}

	return { articles };
};

function generateToken() {
	return crypto.randomBytes(32).toString('hex');
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();

		const token = generateToken();

		const { error } = await supabase
			.from('subscriptions')
			.insert({ email, verification_token: token });

		if (error) {
			if (error.code === '23505') {
				// unique violation (email already exists)
				return "You're already subscribed!";
			}
			return fail(500, { error: 'Subscription failed. Try again later.' });
		}
		return 'Thanks for subscribing!';
	}
};
