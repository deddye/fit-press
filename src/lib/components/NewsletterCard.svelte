<script lang="ts">
	export let nl;
</script>

<a
	href={`/newsletters/${nl.category}`}
	class="block rounded-lg border border-gray-200 p-6 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md dark:border-gray-700 dark:hover:border-indigo-500"
	data-sveltekit-prefetch={false}
>
	<h3 class="mb-2 text-xl font-semibold text-indigo-600 dark:text-indigo-400">
		{nl.name}
	</h3>
	<p class="text-sm text-gray-600 dark:text-gray-400">
		{nl.description}
	</p>
</a>
