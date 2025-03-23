<script lang="ts">
  import type { ClientMessageData } from '$lib';
  import Message from '$lib/components/Message.svelte';

  const { messages }: {
    messages: ClientMessageData[]
  } = $props();
  let orderedMessages = $state<ClientMessageData[]>([]);
  $effect(() => {
      orderedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
    },
  );
</script>

{#each orderedMessages as message, i (i)}
  <Message data={message} at={message.self ? 'end' : 'start'}/>
{/each}