import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

function generateToken() {
	return crypto.randomBytes(32).toString('hex');
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const interests = formData.get('interests')?.toString();
		const interestJson = interests !== undefined ? JSON.parse(interests) : [];

		let { data, error } = await supabase.from('subscriptions').select().eq('email', email);

		if (data && data.length > 0) {
			if (interestJson && interestJson.length > 0) {
				({ data, error } = await supabase
					.from('subscriptions')
					.upsert({ email, interests: interestJson }, { onConflict: 'email' }));

				return error
					? fail(500, { error: 'Something went wrong. Try again later.' })
					: 'Newsletters updated successfully!';
			} else {
				return 'No newsletters selected!';
			}
		}

		// email was not found, we need to add it with a verification token
		const token = generateToken();

		({ error } = await supabase
			.from('subscriptions')
			.insert({ email, interests: interestJson, verification_token: token }));

		if (error) {
			if (error.code === '23505') {
				// unique violation (email already exists)
				return "You're already subscribed!";
			}
			return fail(500, { error: 'Subscription failed. Try again later.' });
		}

		return 'Thanks for subscribing! Please check your email (and spam!!) to confirm your subscription.';
	}
};
