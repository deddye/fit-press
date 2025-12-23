<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let countdown = 3;

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
		class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
	>
		✓
	</div>

	<h1 class="mb-2 text-xl font-semibold">Subscription confirmed!</h1>

	<p class="mb-4 text-gray-600 dark:text-gray-400">
		Your email has been successfully verified. You’ll start receiving FitPress newsletters soon.
	</p>

	<p class="text-sm text-gray-500 dark:text-gray-500">
		Redirecting you back in {countdown}…
	</p>
</div>
