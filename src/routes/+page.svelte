<script lang="ts">
	import NewsletterCard from '$lib/components/NewsletterCard.svelte';
	import { newsletters } from '$lib/data/newsletters';
	import { onDestroy } from 'svelte';
	let email = '';
	let loading = false;
	let message: string | null = null;
	let error: string | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	export let data;
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
			// auto-clear
			timeoutId = setTimeout(() => {
				error = null;
				timeoutId = null;
			}, 2000);
			return;
		}

		loading = true;
		try {
			// submit to the page server action instead of the old API route
			const formData = new FormData();
			formData.append('email', email);
			// include the action name if your page.server.ts action is named `subscribe`
			// remove this line if your action is the default action
			formData.append('subscribe', 'subscribe');

			const res = await fetch(window.location.pathname, {
				method: 'POST',
				body: formData
			});

			const json = await res.json();
			if (!res.ok) {
				error = json?.message ?? 'Subscription failed.';
			} else {
				message = json?.message ?? 'Subscribed!';
				email = '';
			}

			// auto-clear message/error after 2s
			timeoutId = setTimeout(() => {
				message = null;
				error = null;
				timeoutId = null;
			}, 2000);
		} catch (err) {
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
</script>

<section class="mx-auto max-w-4xl px-4 py-12 text-center">
	<h1 class="mb-4 text-4xl font-bold">Your Weekly Fitness Updates</h1>
	<p class="mb-6 text-gray-600">
		Stay updated with the latest in bodybuilding, powerlifting, nutrition, and more.
	</p>

	<div class="mx-auto mb-12 max-w-md">
		<form
			class="flex flex-col items-center gap-3 sm:flex-row"
			on:submit|preventDefault={handleSubscribe}
			aria-label="Subscribe form"
			novalidate
		>
			<label class="sr-only" for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				bind:value={email}
				placeholder="you@domain.com"
				class="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:flex-1"
				required
				aria-required="true"
			/>

			<button
				type="submit"
				class="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
				disabled={loading}
				aria-disabled={loading}
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
	</div>

	<h2 class="mt-16 mb-4 text-2xl font-bold">Browse Categories</h2>
	<div class="grid gap-6 md:grid-cols-2">
		{#each newsletters as nl}
			<NewsletterCard {nl} />
		{/each}
	</div>

	<h2 class="mt-16 mb-4 text-2xl font-bold">Latest Articles</h2>
	<div class="space-y-4">
		{#if articles?.length > 0}
			{#each articles as article}
				<div class="border-b border-gray-200 pb-4 dark:border-gray-800">
					<a href={`/category/${article.category}`} class="text-sm text-indigo-500 hover:underline">
						{article.category}
					</a>
					<h3 class="font-semibold">{article.title}</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">{article.summary}</p>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
						Published: {article.published_at
							? new Date(article.published_at).toLocaleDateString()
							: 'Unknown'}
					</p>
				</div>
			{/each}
		{:else}
			<p class="text-gray-500">No articles yet.</p>
		{/if}
	</div>
</section>
