<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Article } from '$lib/types/article';

	let email = '';
	let loading = false;
	let message: string | null = null;
	let error: string | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	export let data: {
		articles: Article[];
	};

	const { articles } = data;

	function clearMessageTimer() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}

	async function handleSubscribe(e: Event) {
		e.preventDefault();
		clearMessageTimer();
		message = null;
		error = null;

		if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
			error = 'Please enter a valid email.';
			timeoutId = setTimeout(() => (error = null), 4000);
			return;
		}

		loading = true;
		try {
			const formData = new FormData();
			formData.append('email', email);
			formData.append('subscribe', 'subscribe');

			const res = await fetch(window.location.pathname, {
				method: 'POST',
				body: formData
			});

			const json = await res.json();
			const parsed = JSON.parse(json.data);

			if (!res.ok) error = parsed[0] ?? 'Subscription failed.';
			else {
				message = parsed[0] ?? 'Subscribed!';
				email = '';
			}

			timeoutId = setTimeout(() => {
				message = null;
				error = null;
			}, 4000);
		} catch {
			error = 'Network error. Please try again.';
			timeoutId = setTimeout(() => (error = null), 4000);
		} finally {
			loading = false;
		}
	}

	onDestroy(clearMessageTimer);

	$: groupedArticles = articles?.reduce<Record<string, Article[]>>((acc, article) => {
		if (!acc[article.category]) acc[article.category] = [];
		acc[article.category].push(article);
		return acc;
	}, {});

	$: mixedArticles = articles
		? [...articles]
				.sort(
					(a, b) =>
						new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
				)
				.slice(0, 9)
		: [];

	function formatCategory(category: string) {
		if (category === 'HealthAndWellness') return 'Health & Wellness';
		if (category === 'YogaAndMobility') return 'Yoga & Mobility';
		return category;
	}
</script>

<section class="mx-auto max-w-5xl px-4 py-12">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold">Your Weekly Fitness Updates</h1>
		<p class="mb-6 text-gray-400">
			Curated articles on strength, health, and performance — Every week. 💪
		</p>
	</div>

	<div class="mx-auto mb-12 max-w-md text-center">
		<form class="flex flex-col gap-3 sm:flex-row" on:submit|preventDefault={handleSubscribe}>
			<input
				type="email"
				bind:value={email}
				placeholder="Enter your email"
				class="w-full rounded border px-4 py-2 sm:flex-1"
			/>
			<button class="rounded bg-indigo-600 px-4 py-2 text-white" disabled={loading}>
				{loading ? 'Subscribing...' : 'Subscribe'}
			</button>
		</form>

		{#if message}<p class="mt-2 text-green-500">{message}</p>{/if}
		{#if error}<p class="mt-2 text-red-500">{error}</p>{/if}
		<p class="mt-4 text-sm text-gray-500">
			OR ... Subscribe/ Update your newsletter preferences
			<a href="/newsletters" class="text-indigo-500 hover:underline"> HERE → </a>
		</p>
	</div>

	<section class="mb-16">
		<h2 class="mb-6 text-2xl font-semibold text-indigo-400">Recent Articles</h2>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each mixedArticles as article (article.id)}
				<a
					href={article.url}
					target="_blank"
					class="group relative h-64 overflow-hidden rounded-xl"
				>
					{#if article.image_url}
						<img
							src={article.image_url}
							alt={article.title}
							class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
							loading="lazy"
						/>
					{:else}
						<div
							class="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-700 text-gray-300"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-8 w-8 opacity-60"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 4.5v15a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3h-15A1.5 1.5 0 003 4.5zm0 0l6.75 6.75m0 0L21 4.5m-11.25 6.75L3 19.5m6.75-8.25L21 19.5"
								/>
							</svg>
						</div>
					{/if}

					<div class="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>

					<div class="absolute top-2 left-2 rounded bg-indigo-600 px-2 py-1 text-xs text-white">
						{formatCategory(article.category)}
					</div>

					<div class="absolute bottom-0 p-4 text-white">
						<h4 class="line-clamp-2 text-sm font-semibold">{article.title}</h4>
						<p class="mt-1 line-clamp-2 text-xs opacity-80">
							{article.summary}
						</p>

						<p class="mt-1 text-[11px] opacity-70">
							{article.published_at
								? new Date(article.published_at).toLocaleDateString()
								: 'Unknown'}
							{#if article.reading_time}
								<span> • {article.reading_time} min</span>
							{/if}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	{#each Object.entries(groupedArticles) as [category, catArticles]}
		<section class="mb-14 text-left">
			<div class="mb-6 flex items-center justify-between border-b border-gray-700 pb-2">
				<a
					href={`/newsletters/${category}`}
					class="text-xl font-semibold text-indigo-500 capitalize hover:underline"
					data-sveltekit-prefetch={false}
				>
					<h3 class="mb-3 text-xl font-semibold text-indigo-600 capitalize">
						{category === 'HealthAndWellness'
							? 'Health & Wellness'
							: category === 'YogaAndMobility'
								? 'Yoga & Mobility'
								: category}
					</h3>
				</a>
			</div>

			<!-- MOBILE DISPLAY -->
			<div class="flex gap-4 overflow-x-auto pb-2 md:hidden">
				{#each catArticles.slice(0, 6) as article (article.id)}
					<a href={article.url} target="_blank" rel="noopener noreferrer">
						<div class="relative max-w-[180px] min-w-[180px] overflow-hidden rounded-lg shadow-sm">
							<!-- Image / Fallback -->
							{#if article.image_url}
								<img
									src={article.image_url}
									alt={article.title}
									class="h-40 w-full object-cover"
									loading="lazy"
								/>
							{:else}
								<div
									class="flex h-40 w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-700 text-gray-300"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-8 w-8 opacity-60"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M3 4.5v15a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3h-15A1.5 1.5 0 003 4.5zm0 0l6.75 6.75m0 0L21 4.5m-11.25 6.75L3 19.5m6.75-8.25L21 19.5"
										/>
									</svg>
								</div>
							{/if}

							<!-- Gradient -->
							<div class="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>

							<!-- Category Badge -->
							<div class="absolute top-2 left-2 rounded bg-indigo-600 px-2 py-1 text-xs text-white">
								{formatCategory(category)}
							</div>

							<!-- Content -->
							<div class="absolute right-2 bottom-2 left-2 text-white">
								<h4 class="line-clamp-2 text-sm leading-tight font-semibold drop-shadow">
									{article.title}
								</h4>

								<p class="mt-1 line-clamp-3 text-xs opacity-90 drop-shadow">
									{article.summary}
								</p>

								<p class="mt-1 text-[10px] opacity-70">
									{article.published_at
										? new Date(article.published_at).toLocaleDateString()
										: 'Unknown'}
									{#if article.reading_time}
										<span> • {article.reading_time} min</span>
									{/if}
								</p>
							</div>
						</div>
					</a>
				{/each}
			</div>

			<div class="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
				{#each catArticles.slice(0, 6) as article (article.id)}
					<a href={article.url} target="_blank" class="relative h-64 overflow-hidden rounded-xl">
						{#if article.image_url}
							<img
								src={article.image_url}
								alt={article.title}
								class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-700 text-gray-300"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-8 w-8 opacity-60"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 4.5v15a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3h-15A1.5 1.5 0 003 4.5zm0 0l6.75 6.75m0 0L21 4.5m-11.25 6.75L3 19.5m6.75-8.25L21 19.5"
									/>
								</svg>
							</div>
						{/if}

						<div
							class="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"
						></div>

						<div class="absolute right-0 bottom-0 left-0 p-4 text-white">
							<h4 class="line-clamp-2 text-sm font-semibold">
								{article.title}
							</h4>
							<p class="mt-1 line-clamp-2 text-xs opacity-90">
								{article.summary}
							</p>
							<p class="mt-2 text-[11px] opacity-70">
								{article.published_at
									? new Date(article.published_at).toLocaleDateString()
									: 'Unknown'}
								{#if article.reading_time}
									<span> • {article.reading_time} min</span>
								{/if}
							</p>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<div class="mt-12 text-center">
		<a href="/all-categories" class="rounded bg-indigo-600 px-6 py-3 text-white">
			Browse All Categories →
		</a>
	</div>
</section>
