import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export async function GET({ url, request }) {
	const token = url.searchParams.get('token');
	if (!token) return Response.redirect(new URL('/', request.url), 303);

	const { data } = await supabase
		.from('subscriptions')
		.select('*')
		.eq('verification_token', token)
		.single();

	if (!data) {
		return Response.redirect(new URL('/verify-failed', request.url), 303);
	}

	await supabase
		.from('subscriptions')
		.update({
			verified: true,
			verified_at: new Date().toISOString(),
			verification_token: null
		})
		.eq('email', data.email);

	return Response.redirect(new URL('/verify-success', request.url), 303);
}
