<script lang="ts">
	/* import { GUIso } from 'guiso'; */
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
	import { javascript } from '@codemirror/lang-javascript';
	import { onMount } from 'svelte';
	import { Editor, type EditorType } from '$lib/code-editor';

	let editor: HTMLDivElement;
	let counts = 0;
	let editorOne: EditorType;
	const doc = `if (true) {
  		console.log("okay")
	} else {
		console.log("oh no")
	}
	`;

	const increment = () => {
		editorOne.countIncrement();
		counts = editorOne.count;
	};

	onMount(() => {
		editorOne = Editor(editor);
		/* editorOne.newEditor(); */
		
	/* 	new EditorView({
			doc,
			extensions: [basicSetup, keymap.of([indentWithTab]), javascript()],
			parent: editor
		}); */
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>{counts}</p>
<button on:click={increment}>add</button>
<button on:click={editorOne.newEditor}> add editor</button>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<div bind:this={editor}></div>
