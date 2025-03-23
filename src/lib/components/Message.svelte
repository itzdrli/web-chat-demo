<script lang="ts">
  import type { MessageData } from '$lib';
  import { Card } from 'm3-svelte';

  const { data, at }: {
    data: MessageData,
    at: 'end' | 'start'
  } = $props();
</script>

<div class="message-container {at} m3-container">
  <p class="username">{data.username}</p>
  <div class="message {at}">
    <Card type="elevated">{data.content}</Card>
  </div>
</div>

<style lang="postcss">
  .message-container {
    display: flex;
    flex-direction: column;

    &.start {
      align-items: flex-start;
    }

    &.end {
      align-items: flex-end;
    }

    & .username {
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 0.5rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }

  .message {
    display: flex;

    &.start {
      justify-content: flex-start;
    }

    &.end {
      justify-content: flex-end;
    }
  }
</style>