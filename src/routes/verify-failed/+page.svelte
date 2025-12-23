<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let countdown = 5;

	onMount(() => {
		const interval = setInterval(() => {
			countdown -= 1;
			if (countdown === 0) {
				clearInterval(interval);
				goto('/');
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="mx-auto max-w-md p-6 text-center">
	<div
		class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
		       bg-red-100 text-red-600
		       dark:bg-red-900/30 dark:text-red-400"
	>
		<span class="text-xl font-bold">✕</span>
	</div>

	<h1 class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Verification failed</h1>

	<p class="mb-4 text-gray-600 dark:text-gray-400">
		This verification link is invalid, expired, or has already been used.
	</p>

	<p class="text-sm text-gray-500 dark:text-gray-500">
		Redirecting you back to the homepage in {countdown}…
	</p>
</div>
