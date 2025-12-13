import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { fail } from '@sveltejs/kit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Please enter a valid email.' });
		}

		const { error, data } = await supabase
			.from('subscriptions')
			.delete()
			.eq('email', email)
			.select();

		if (error) {
			return fail(500, { error: 'Unsubscribe failed. Try again later.' });
		}

		if (!data || data.length === 0) {
			return fail(404, { error: 'Email not found or already unsubscribed.' });
		}
		return { success: true, message: 'You have been unsubscribed successfully.' };
	}
};
