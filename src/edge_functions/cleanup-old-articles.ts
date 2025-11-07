// supabase/functions/cleanup-old-articles/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async () => {
	console.log('🧹 Running article cleanup job...');
	const supabase = createClient(
		Deno.env.get('SUPABASE_URL'),
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
	);
	const { error } = await supabase.rpc('delete_old_articles');
	if (error) {
		console.error('❌ Error cleaning old articles:', error.message);
		return new Response(
			JSON.stringify({
				success: false,
				error: error.message
			}),
			{
				status: 500
			}
		);
	}
	console.log('✅ Old articles cleaned successfully.');
	return new Response(
		JSON.stringify({
			success: true
		}),
		{
			status: 200
		}
	);
});
