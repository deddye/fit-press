<script lang="ts">
	export let data;
	const { category, articles } = data;
</script>

<section class="mx-auto max-w-4xl px-4 py-12">
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
			{category} News
		</h1>

		<a
			href="/"
			class="inline-block rounded bg-indigo-100 px-4 py-2 text-indigo-700 transition hover:bg-indigo-200 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700"
		>
			← Back to all newsletters
		</a>
	</div>

	{#if articles?.length > 0}
		<div class="space-y-8">
			{#each articles as article}
				<article
					class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
				>
					<h2 class="mb-2 text-xl font-semibold">{article.title}</h2>
					<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{article.summary}</p>

					<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
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
		<p class="text-gray-600 dark:text-gray-400">
			No articles found for {category}. Check back later!
		</p>
	{/if}

	<a
		href="/"
		class="mt-12 inline-block text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
	>
		← Back to all newsletters
	</a>
</section>
