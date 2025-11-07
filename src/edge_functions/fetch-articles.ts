import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.52.0';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4';
const parser = new XMLParser();
// Edge functions use Deno runtime; env vars come from Deno.env.get
const supabase = createClient(
	Deno.env.get('SUPABASE_URL'),
	Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);
const openai = new OpenAI({
	apiKey: Deno.env.get('OPENAI_API_KEY')
});
Deno.serve(async (req) => {
	try {
		console.log('Starting fetch...');
		// ✅ Call your existing fetchArticles() logic here
		await fetchArticles();
		return new Response('Fetch complete', {
			status: 200
		});
	} catch (err) {
		console.error(err);
		return new Response('Error running fetch', {
			status: 500
		});
	}
});
const feeds = {
	Bodybuilding: 'https://www.bodybuilding.com/rss/articles.xml',
	Powerlifting: 'https://www.powerliftingtechnique.com/feed/',
	Running: 'https://www.runnersworld.com/rss/all.xml',
	Nutrition: 'https://www.nutrition.org/feed/',
	CrossFit: 'https://morningchalkup.com/feed/',
	Supplements: 'https://supplementclarity.com/feed/'
};
async function fetchFeed(url: any) {
	const res = await fetch(url);
	const xml = await res.text();
	const json = parser.parse(xml);
	const items = json?.rss?.channel?.item ?? json?.feed?.entry ?? [];
	return Array.isArray(items) ? items : [items];
}
function stripHtml(html: any) {
	return html
		.replace(/<[^>]*>/g, '') // Remove all HTML tags like <p>, <a>, etc.
		.replace(/\s+/g, ' ') // Collapse extra spaces/newlines
		.trim();
}
async function fetchArticles() {
	console.log('🔄 Fetching fitness articles...');
	for (const [category, url] of Object.entries(feeds)) {
		try {
			const items = await fetchFeed(url);
			let inserted = 0;
			for (const item of items.slice(0, 5)) {
				const title = item.title;
				const link = item.link?.href ?? item.link;
				const summary = stripHtml(
					item.description ?? item.summary ?? item['content:encoded']?.slice(0, 200) ?? ''
				);
				const { error } = await supabase.from('articles').upsert(
					{
						category,
						title,
						url: link,
						summary,
						published_at: item.pubDate || item.updated || new Date().toISOString(),
						fetched_at: new Date().toISOString()
					},
					{
						onConflict: 'url'
					}
				);
				if (!error) inserted++;
				else console.error(error);
			}
			console.log(`✅ ${category}: ${inserted} articles updated.`);
		} catch (err) {
			console.error(`❌ Error fetching ${category}:`, err);
		}
	}
	console.log('🏁 Fetch complete!');
}

// Function once I add in AI summaries

// async function fetchArticles() {
//   console.log('🔄 Fetching new fitness articles...');
//   for (const [category, url] of Object.entries(feeds)){
//     try {
//       const feed = await parser.parseURL(url);
//       const latest = feed.items.slice(0, 5);
//       let insertedCount = 0;
//       for (const item of latest){
//         if (!item.title || !item.link) continue;
//         // const summary = await summarize(item.contentSnippet || item.title);
//         const summary = 'dummy summary';
//         const { error } = await supabase.from('articles').upsert({
//           category,
//           title: item.title,
//           url: item.link,
//           summary,
//           published_at: item.isoDate || new Date().toISOString(),
//           fetched_at: new Date().toISOString()
//         }, {
//           onConflict: 'url'
//         });
//         if (error) console.error('Supabase insert error:', error);
//         else insertedCount++;
//       }
//       console.log(`✅ ${category}: ${insertedCount} articles updated.`);
//     // --- AI Fallback ---
//     // if (insertedCount < 3) {
//     // 	console.log(
//     // 		`⚠️ Only ${insertedCount} articles found for ${category}. Generating filler...`
//     // 	);
//     // 	await createAIFiller(category);
//     // }
//     } catch (err) {
//       console.error(`❌ Error fetching ${category}:`, err);
//     }
//   }
// }
async function summarize(text: string) {
	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'user',
					content: `Summarize this fitness article in 2 sentences, highlighting the key takeaway:\n\n${text}`
				}
			]
		});
		return completion.choices[0].message?.content?.trim() ?? '';
	} catch (err) {
		console.error('Error summarizing:', err);
		return '';
	}
}

async function createAIFiller(category: string) {
	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: 'You are a fitness journalist for a daily newsletter called FitPress.'
				},
				{
					role: 'user',
					content: `Generate a short, original article (about 150 words) with a catchy headline and a few actionable insights for readers interested in ${category}. Format it as: "Title: ... Summary: ...".`
				}
			]
		});
		const text = completion.choices[0].message?.content ?? '';
		const [_, title, summary] = text.match(/Title:\s*(.*?)\s*Summary:\s*(.*)/s) || [];
		await supabase.from('articles').insert({
			category,
			title: title || `AI Spotlight: ${category}`,
			summary: summary || text.slice(0, 200),
			url: '#',
			published_at: new Date().toISOString(),
			fetched_at: new Date().toISOString()
		});
		console.log(`✨ Added AI filler article for ${category}`);
	} catch (err) {
		console.error(`Error generating AI filler for ${category}:`, err);
	}
}
