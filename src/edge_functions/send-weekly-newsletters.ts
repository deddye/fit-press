// FitPress Weekly Newsletter - Deno Edge Function using fetch() with Resend API
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);
async function sendEmail(to, subject, html) {
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: 'FitPress <newsletter@fitpress.app>',
			to,
			subject,
			html
		})
	});
	if (!res.ok) {
		const text = await res.text();
		console.error(`❌ Failed to send email to ${to}:`, text);
	} else {
		console.log(`✅ Sent newsletter to ${to}`);
	}
}
Deno.serve(async () => {
	console.log('📨 Starting weekly FitPress newsletter job...');
	// Fetch subscribers
	const { data: subscribers, error: subError } = await supabase
		.from('subscriptions')
		.select('email, interests');
	if (subError || !subscribers) {
		console.error('❌ Error fetching subscriptions:', subError);
		return new Response('Failed to fetch subscriptions', {
			status: 500
		});
	}
	const { data: articles, error: artError } = await supabase
		.from('articles')
		.select('*')
		.order('published_at', {
			ascending: false
		});
	if (artError || !articles) {
		console.error('❌ Error fetching articles:', artError);
		return new Response('Failed to fetch articles', {
			status: 500
		});
	}
	// Group by category
	const grouped = {};
	for (const a of articles) {
		const cat = a.category ?? 'Uncategorized';
		if (!grouped[cat]) grouped[cat] = [];
		grouped[cat].push(a);
	}
	for (const sub of subscribers) {
		const { email, interests } = sub;
		const hasInterests = interests && interests.length > 0;
		const selectedCats = hasInterests ? interests : Object.keys(grouped);
		const sections = selectedCats
			.map((cat) => {
				const items = grouped[cat]?.slice(0, hasInterests ? 3 : 2) ?? [];
				if (!items.length) return '';
				const articlesHtml = items
					.map(
						(a) => `
            <div style="margin-bottom: 12px;">
              <h4>${a.title}</h4>
              <p style="color:#444;">${a.summary ?? ''}</p>
              <a href="${a.url}" style="color:#2563eb;text-decoration:none;">Read more →</a>
            </div>`
					)
					.join('');
				return `
          <div style="margin-bottom:24px;">
            <h2 style="color:#111;">${cat}</h2>
            ${articlesHtml}
          </div>`;
			})
			.join('');
		if (!sections.trim()) continue;
		const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.6;">
        <h1 style="text-align:center;">🏋️‍♀️ Your FitPress Weekly Roundup</h1>
        <p style="text-align:center;">Hey ${email.split('@')[0]}, here’s your personalized digest 💪</p>
        <hr style="margin:20px 0;" />
        ${sections}
        <hr style="margin:24px 0;" />
        <p style="font-size:0.9em;color:#666;">
          You’re receiving this because you subscribed to FitPress.<br/>
          Update your interests anytime at <a href="https://fitpress.app" style="color:#2563eb;">fitpress.app</a>.
        </p>
      </div>
    `;
		await sendEmail(email, '🔥 Your Weekly FitPress Fitness Digest', html);
		await new Promise((r) => setTimeout(r, 600)); // slow down for Resend free-tier
	}
	console.log('✅ Newsletter job complete.');
	return new Response('Newsletter job complete', {
		status: 200
	});
});
