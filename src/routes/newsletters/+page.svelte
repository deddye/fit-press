<script lang="ts">
	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { newsletters } from '$lib/data/newsletters';
	import { onDestroy } from 'svelte';

	let email = '';
	let interests: string[] = [];
	let loading = false;
	let message: string | null = null;
	let error: string | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const categoryEmoji: Record<string, string> = {
		Bodybuilding: '🏋️‍♂️',
		Powerlifting: '💪',
		CrossFit: '🔥',
		Nutrition: '🥗',
		Running: '🏃',
		Supplements: '💊',
		HealthAndWellness: '🧠',
		YogaAndMobility: '🧘'
	};

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
			const formData = new FormData();
			formData.append('email', email);
			formData.append('interests', JSON.stringify(interests));
			formData.append('subscribe', 'subscribe');

			const res = await fetch(window.location.pathname, {
				method: 'POST',
				body: formData
			});

			const json = await res.json();

			const data = JSON.parse(json.data);

			if (!res.ok) {
				error = data[0] ?? 'Subscription failed.';
			} else {
				message = data[0] ?? 'Subscribed!';
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

	function togglePreference(pref: string) {
		if (interests.includes(pref)) {
			interests = interests.filter((p) => p !== pref);
		} else {
			interests = [...interests, pref];
		}
	}
</script>

<div class="mx-auto max-w-lg p-6">
	<h1 class="mb-4 text-center text-2xl font-bold">Choose Your FitPress Newsletters</h1>

	<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
		{#each newsletters as newsletter}
			<button
				type="button"
				on:click={() => togglePreference(newsletter.name)}
				aria-pressed={interests.includes(newsletter.name)}
				class={`group newsletter-tile rounded-xl border p-4 text-center transition
				${
					interests.includes(newsletter.name)
						? 'border-indigo-600  bg-indigo-900/30 ring-2 ring-indigo-500'
						: 'border-gray-700 bg-gray-800'
				}`}
			>
				<div class="mb-2 text-3xl">
					{categoryEmoji[newsletter.category]}
				</div>

				<p class="font-semibold text-gray-100">
					{newsletter.name}
				</p>
			</button>
		{/each}
	</div>

	<label class="sr-only" for="email">Email</label>
	<input
		id="email"
		name="email"
		type="email"
		bind:value={email}
		placeholder="Enter your email"
		class="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:flex-1"
		required
		aria-required="true"
	/>

	<button
		on:click={handleSubscribe}
		disabled={loading}
		class="mt-3 w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
	>
		{#if loading}
			Updating...
		{:else}
			Subscribe
		{/if}
	</button>
	{#if message}
		<p class="mt-3 text-sm text-green-600">{message}</p>
	{/if}
	{#if error}
		<p class="mt-3 text-sm text-red-600">{error}</p>
	{/if}
</div>

<style>
	@media (hover: hover) and (pointer: fine) {
		/* Light mode hover */
		button.newsletter-tile:hover {
			transform: translateY(-2px);
			border-color: #6366f1;
			background-color: rgba(99, 102, 241, 0.2);
		}
	}
</style>
