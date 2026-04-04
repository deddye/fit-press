<script lang="ts">
	import { newsletters } from '$lib/data/newsletters';

	function formatCategory(category: string) {
		if (category === 'HealthAndWellness') return 'Health & Wellness';
		if (category === 'YogaAndMobility') return 'Yoga & Mobility';
		return category;
	}
</script>

<section class="mx-auto max-w-2xl px-4 py-12">
	<h1 class="mb-8 text-3xl font-bold">All Categories</h1>

	<ul class="divide-y divide-gray-800 border-t border-gray-800">
		{#each newsletters as item}
			<li>
				<a
					href={`/newsletters/${item.category}`}
					class="flex items-center justify-between py-4 text-lg text-gray-300 transition hover:text-indigo-400"
				>
					<span>{formatCategory(item.category)}</span>
					<span class="text-sm text-gray-500">→</span>
				</a>
			</li>
		{/each}
	</ul>

	<a href="/" class="mt-10 inline-block text-indigo-500 hover:underline"> ← Back to homepage </a>
</section>
