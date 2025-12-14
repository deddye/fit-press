<script lang="ts">
	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { newsletters } from '$lib/data/newsletters';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	let email = '';
	let interests: string[] = [];
	let loading = false;
	let message = '';
	let messageType: 'success' | 'error' | '' = '';
	let messageTimeout: NodeJS.Timeout | null = null;

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

	async function subscribe() {
		if (!email) {
			showMessage('Please enter your email.', 'error');
			return;
		}

		loading = true;
		message = '';
		messageType = '';

		try {
			const { error } = await supabase
				.from('subscriptions')
				.upsert({ email, interests }, { onConflict: 'email' });

			if (error) throw error;

			showMessage('Subscriptions updated successfully!', 'success');
			email = '';
			interests = [];
		} catch (err) {
			console.error(err);
			showMessage('Something went wrong. Please try again later.', 'error');
		} finally {
			loading = false;
		}
	}

	function togglePreference(pref: string) {
		if (interests.includes(pref)) {
			interests = interests.filter((p) => p !== pref);
		} else {
			interests = [...interests, pref];
		}
	}

	function showMessage(text: string, type: 'success' | 'error') {
		message = text;
		messageType = type;

		// Clear any existing timeout before starting a new one
		if (messageTimeout) clearTimeout(messageTimeout);

		messageTimeout = setTimeout(() => {
			message = '';
			messageType = '';
		}, 3000);
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
						? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/30'
						: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
				}`}
			>
				<div class="mb-2 text-3xl">
					{categoryEmoji[newsletter.category]}
				</div>

				<p class="font-semibold text-gray-900 dark:text-gray-100">
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
		on:click={subscribe}
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
		<p
			class={`mt-3 text-center text-sm transition-opacity duration-300 ${
				messageType === 'success'
					? 'text-green-600 dark:text-green-400'
					: 'text-red-600 dark:text-red-400'
			}`}
		>
			{message}
		</p>
	{/if}
</div>

<style>
	@media (hover: hover) and (pointer: fine) {
		/* Light mode hover */
		button.newsletter-tile:hover {
			transform: translateY(-2px);
			border-color: #818cf8;
			background-color: #eef2ff;
		}
	}

	@media (hover: hover) and (pointer: fine) and (prefers-color-scheme: dark) {
		button.newsletter-tile:hover {
			border-color: #6366f1;
			background-color: rgba(99, 102, 241, 0.2);
		}
	}
</style>
