<script lang="ts">
	import { pixiEditor } from '$lib/editor-pixi';
	import { onMount } from 'svelte';

	let instance: HTMLDivElement;
	let textarea: HTMLInputElement;

	const editor = pixiEditor();
	editor.onKeyPress((e: any) => {
		console.log(e.key, '[keypress html]');
	});

	onMount(() => {
		editor.mount(instance);

		/* instance.addEventListener('click', (e) => {
			console.log(e.shiftKey, 'keypress');
		}); */
	});
</script>

<h1>Welcome to SvelteKit</h1>
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div tabindex="0" style="width: 500px;height:300px" id="instance" bind:this={instance}></div>
<!-- <input bind:this={textarea} on:input={handleInput} /> -->
<button on:click={() => editor.change('asd')}> CLICK!</button>

<!-- <style>
	input {
		width: 100px;
		height: 20px;
		background-color: red;
		position: absolute;
		z-index: 1000;
	}
</style> -->
