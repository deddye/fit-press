<script lang="ts">
	import { onDestroy } from 'svelte';

	let email = '';
	let loading = false;
	let message: string | null = null;
	let error: string | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	function clearMessageTimer() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}

	async function handleUnsubscribe(e: Event) {
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
			formData.append('unsubscribe', 'unsubscribe');

			const res = await fetch(window.location.pathname, {
				method: 'POST',
				body: formData
			});

			const json = await res.json();

			if (json.type === 'failure' || !res.ok) {
				let data = '';
				if (typeof json.data === 'string') {
					data = JSON.parse(json.data);
				}
				if (Array.isArray(data) && data.length > 1) {
					message = data[1] as string;
				} else {
					error = 'Unsubscribe failed.';
				}
			} else {
				message = 'Unsubscribed successfully!';
				email = '';
			}

			// auto-clear after 2s
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

<section class="mx-auto max-w-md px-4 py-12 text-center">
	<h1 class="mb-4 text-3xl font-bold text-gray-100">
		We're sorry to see you go! Check back in the future, we may have some improvements.
	</h1>
	<p class="mb-6 text-gray-300">Enter your email below to stop receiving our newsletter.</p>

	<form class="flex flex-col gap-3" on:submit|preventDefault={handleUnsubscribe} novalidate>
		<label class="sr-only" for="email">Email</label>
		<input
			id="email"
			type="email"
			bind:value={email}
			placeholder="Enter your email"
			class="w-full rounded border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
			required
			aria-required="true"
		/>

		<button
			type="submit"
			class="flex w-full items-center justify-center gap-1 rounded bg-red-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
			disabled={loading}
		>
			{#if loading}
				Processing...
			{:else}
				⚠️ Unsubscribe
			{/if}
		</button>
	</form>

	{#if message}
		<p class="mt-3 text-sm text-green-600">{message}</p>
	{/if}
	{#if error}
		<p class="mt-3 text-sm text-red-600">{error}</p>
	{/if}
</section>
