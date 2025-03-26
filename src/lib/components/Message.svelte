<script lang="ts">
  import type { BroadcastMessage } from '$lib';

  const { data, at }: {
    data: BroadcastMessage,
    at: 'end' | 'start'
  } = $props();

  const taglineString = $derived(data.user.tagline.toString().padStart(2, '0'));
</script>

<div class="message-container {at}">
  <p class="username">{data.user.username}<span
    class="tagline">{taglineString}</span></p>
  <div class="message {at}">
    {@html data.processedContent}
  </div>
</div>

<style lang="postcss">
  .message-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: visible;

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

      & .tagline {
        font-weight: normal;
        margin-left: 0.2rem;

        &:before {
          content: '#';
        }

        color: rgb(var(--m3-scheme-on-surface-variant));
      }
    }
  }

  :root {
    --m3-card-shape: var(--m3-util-rounding-medium);
  }

  .message {
    min-height: 2.8rem;
    max-width: 80%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    gap: 0.5rem;
    border-radius: var(--m3-card-shape);
    color: rgb(var(--m3-scheme-on-surface));
    background-color: rgb(var(--m3-scheme-surface-container-low));
    box-shadow: var(--m3-util-elevation-1);
    overflow: auto;

  }

  @media (forced-colors: active) {
    .message {
      outline: solid 0.125rem;
    }
  }
</style>