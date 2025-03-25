<script lang="ts">
  import type { BroadcastMessage } from '$lib';
  import Message from '$lib/components/Message.svelte';
  import { onMount, tick } from 'svelte';

  let list: HTMLDivElement;
  const { messages }: { messages: BroadcastMessage[] } = $props();

  let atBottom = $state(true);

  export const gotoBottomSmooth = async (force = false) => {
    if (!(force || atBottom)) return;
    await tick();
    list.lastElementChild?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  };

  export const gotoBottom = async (force = false) => {
    if (!(force || atBottom)) return;
    await tick();
    list.scrollTop = list.scrollHeight - list.offsetHeight;
  };

  onMount(() => {
    list.addEventListener('scrollend', () => {
      const { scrollTop, scrollHeight, offsetHeight } = list;
      const min = scrollHeight - offsetHeight - 100;
      const max = scrollHeight - offsetHeight + 100;
      if (scrollTop > min && scrollTop < max) {
        atBottom = true;
      } else {
        atBottom = false;
      }
    });
  });
</script>

<div class="message-list" bind:this={list}>
  {#each messages as message, i (i)}
    <Message data={message} at={message.self ? 'end' : 'start'}/>
  {/each}
</div>

<style lang="postcss">
  .message-list {
    padding: 1rem;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 1rem;
    grid-area: message-list;
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>