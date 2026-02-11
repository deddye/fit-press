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
			timeoutId = setTimeout(() => {
				error = null;
				timeoutId = null;
			}, 2000);
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

			if (!res.ok) {
				error = parsed[0] ?? 'Subscription failed.';
			} else {
				message = parsed[0] ?? 'Subscribed!';
				email = '';
			}

			timeoutId = setTimeout(() => {
				message = null;
				error = null;
				timeoutId = null;
			}, 2000);
		} catch {
			error = 'Network error. Please try again.';
			timeoutId = setTimeout(() => {
				error = null;
				timeoutId = null;
			}, 2000);
		} finally {
			loading = false;
		}
	}

	onDestroy(() => {
		clearMessageTimer();
	});

	// ✅ Properly typed grouping
	$: groupedArticles = articles?.reduce<Record<string, Article[]>>((acc, article) => {
		if (!acc[article.category]) {
			acc[article.category] = [];
		}
		acc[article.category].push(article);
		return acc;
	}, {});
</script>

<section class="mx-auto max-w-5xl px-4 py-12">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold">Your Weekly Fitness Updates</h1>
		<p class="mb-6 text-gray-400">
			Curated articles on strength, health, and performance — Every week. 💪
		</p>
	</div>

	<!-- Subscribe Form -->
	<div class="mx-auto mb-12 max-w-md text-center">
		<form
			class="flex flex-col items-center gap-3 sm:flex-row"
			on:submit|preventDefault={handleSubscribe}
			novalidate
		>
			<input
				type="email"
				bind:value={email}
				placeholder="Enter your email"
				class="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:flex-1"
				required
			/>

			<button
				type="submit"
				class="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
				disabled={loading}
			>
				{#if loading}Subscribing...{:else}Subscribe{/if}
			</button>
		</form>

		{#if message}
			<p class="mt-3 text-sm text-green-600">{message}</p>
		{/if}
		{#if error}
			<p class="mt-3 text-sm text-red-600">{error}</p>
		{/if}

		<p class="mt-4 text-sm text-gray-500">
			OR ... Subscribe/ Update your newsletter preferences
			<a href="/newsletters" class="text-indigo-500 hover:underline"> HERE → </a>
		</p>
	</div>

	<!-- Articles by Category -->
	{#if groupedArticles && Object.keys(groupedArticles).length > 0}
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
					<a href={`/newsletters/${category}`} class="text-sm text-gray-400 hover:text-indigo-400">
						View all →
					</a>
				</div>
				<!-- MOBILE: Horizontal Scroll -->
				<div class="flex gap-4 overflow-x-auto pb-2 md:hidden">
					{#each catArticles.slice(0, 6) as article (article.id)}
						<a href={article.url} target="_blank" rel="noopener noreferrer">
							<div
								class="relative max-w-[180px] min-w-[180px] shrink-0 snap-start overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
							>
								<!-- Article Image (safe with fallback) -->
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

								<!-- Gradient Overlay -->
								<div
									class="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"
								></div>

								<!-- Text Content -->
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
									</p>
								</div>
							</div>
						</a>
					{/each}
				</div>

				<!-- DESKTOP: Grid Layout -->
				<div class="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
					{#each catArticles.slice(0, 6) as article (article.id)}
						<a
							href={article.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group relative block h-64 overflow-hidden rounded-xl shadow-md transition hover:shadow-xl"
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
									class="flex h-64 w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-700 text-gray-300"
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
								</p>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	{:else}
		<p class="text-center text-gray-500">No articles yet.</p>
	{/if}
</section>
