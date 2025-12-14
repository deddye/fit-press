<script lang="ts">
	export let nl;
</script>

<a
	href={`/newsletters/${nl.category}`}
	class="block rounded-lg border border-gray-700 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-500 hover:shadow-md"
	data-sveltekit-prefetch={false}
>
	<h3 class="mb-2 text-xl font-semibold text-indigo-400">
		{nl.name}
	</h3>
	<p class="text-sm text-gray-400">
		{nl.description}
	</p>
</a>
