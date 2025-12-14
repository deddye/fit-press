<script lang="ts">
	export let data;
	const { category, articles } = data;
</script>

<section class="mx-auto max-w-4xl px-4 py-12">
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-4xl font-bold text-indigo-400">
			{category === 'HealthAndWellness'
				? 'Health & Wellness'
				: category === 'YogaAndMobility'
					? 'Yoga & Mobility'
					: category} News
		</h1>

		<a
			href="/"
			class="inline-block rounded bg-gray-800 px-4 py-2 text-indigo-400 transition hover:bg-gray-700"
		>
			← Back to all newsletters
		</a>
	</div>

	{#if articles?.length > 0}
		<div class="space-y-8">
			{#each articles as article}
				<article
					class="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm transition hover:shadow-md"
				>
					<h2 class="mb-2 text-xl font-semibold">{article.title}</h2>
					<p class="mb-3 text-sm text-gray-400">{article.summary}</p>

					<div class="flex items-center justify-between text-xs text-gray-500">
						<span>
							Published: {article.published_at
								? new Date(article.published_at).toLocaleDateString()
								: 'Unknown'}
						</span>
						<a
							href={article.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-indigo-500 hover:underline"
						>
							Read more →
						</a>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<p class="text-gray-400">
			No articles found for {category}. Check back later!
		</p>
	{/if}

	<a href="/" class="mt-12 inline-block text-indigo-500 hover:text-indigo-400">
		← Back to all newsletters
	</a>
</section>
