<script lang="ts">
  import type { ClientMessageData } from '$lib';
  import Message from '$lib/components/Message.svelte';

  const { messages }: {
    messages: ClientMessageData[]
  } = $props();
</script>

{#each messages as message, i (i)}
  <Message data={message} at={message.self ? 'end' : 'start'}/>
{/each}