export {};

const doThing = async () => {
	const res = await fetch(
		'https://morningchalkup.com/2025/11/02/2025-rogue-invitational-results-laura-horvath-jeff-adler/'
	);

	const html = await res.text();

	// look for og:image
	const ogImage = html.match(
		/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
	)?.[1];

	console.log('OG Image:', ogImage);
};

doThing();
