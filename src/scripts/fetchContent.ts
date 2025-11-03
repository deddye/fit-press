import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env.development' });

// --- Setup ---
const parser = new Parser();
const supabase = createClient(
	process.env.PUBLIC_SUPABASE_URL!,
	process.env.PUBLIC_SUPABASE_ANON_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Configuration ---
const feeds: Record<string, string> = {
	Bodybuilding: 'https://www.bodybuilding.com/rss/articles.xml',
	Powerlifting: 'https://www.powerliftingtechnique.com/feed/',
	Running: 'https://www.runnersworld.com/rss/all.xml',
	Nutrition: 'https://www.nutrition.org/feed/',
	CrossFit: 'https://morningchalkup.com/feed/',
	Supplements: 'https://supplementclarity.com/feed/'
};

// --- Utility: summarize with AI ---
async function summarize(text: string): Promise<string> {
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

// --- Utility: create AI filler article ---
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

// --- Main fetching function ---
async function fetchArticles() {
	console.log('🔄 Fetching new fitness articles...');
	for (const [category, url] of Object.entries(feeds)) {
		try {
			const feed = await parser.parseURL(url);
			const latest = feed.items.slice(0, 5);
			let insertedCount = 0;

			for (const item of latest) {
				if (!item.title || !item.link) continue;

				// const summary = await summarize(item.contentSnippet || item.title);
				const summary = 'dummy summary';
				const { error } = await supabase.from('articles').upsert(
					{
						category,
						title: item.title,
						url: item.link,
						summary,
						published_at: item.isoDate || new Date().toISOString(),
						fetched_at: new Date().toISOString()
					},
					{ onConflict: 'url' }
				);

				if (error) console.error('Supabase insert error:', error);
				else insertedCount++;
			}

			console.log(`✅ ${category}: ${insertedCount} articles updated.`);

			// --- AI Fallback ---
			// if (insertedCount < 3) {
			// 	console.log(
			// 		`⚠️ Only ${insertedCount} articles found for ${category}. Generating filler...`
			// 	);
			// 	await createAIFiller(category);
			// }
		} catch (err) {
			console.error(`❌ Error fetching ${category}:`, err);
		}
	}
}

// --- Run ---
await fetchArticles();
console.log('🏁 Fetch complete!');
process.exit(0);
