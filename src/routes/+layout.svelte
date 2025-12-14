<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../app.css';

	const currentYear = new Date().getFullYear();
</script>

<header
	class="flex items-center justify-between bg-gray-900 p-4 shadow-md transition-colors duration-300"
>
	<div class="flex flex-1 items-center justify-center space-x-6">
		<a href="/" class="flex items-center space-x-2 transition hover:opacity-80">
			<img src="/fp-logo.png" alt="FitPress logo" class="h-8 w-8" />
			<span class="text-2xl font-bold text-indigo-400">FitPress</span>
		</a>

		<a
			href="/newsletters"
			class="font-medium text-gray-300 hover:text-indigo-400"
			class:font-bold={$page.url.pathname === '/newsletters'}
		>
			Newsletters
		</a>
	</div>
</header>

<main class="min-h-screen bg-gray-950 text-gray-100 transition-colors duration-300">
	<slot />
</main>

<footer
	class="border-t border-gray-800 bg-gray-900 py-6 text-center text-sm text-gray-400 transition-colors duration-300"
>
	<div class="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
		<a href="/privacy" class=" hover:text-indigo-400 hover:underline"> Privacy Policy </a>

		<span class="opacity-50">•</span>

		<a href="mailto:contact@fitpress.app" class=" hover:text-indigo-400 hover:underline">
			Contact
		</a>

		<span class="opacity-50">•</span>

		<a href="/unsubscribe" class="hover:text-indigo-400 hover:underline"> Unsubscribe </a>
	</div>

	<div>
		© {currentYear}{' '}
		<span class="font-semibold text-indigo-400"> FitPress </span>
		— For lifelong movers. 🧠 🏃
	</div>
</footer>
