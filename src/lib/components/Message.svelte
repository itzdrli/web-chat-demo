<script lang="ts">
  import type { ClientMessageData } from '$lib';

  const { data, at }: {
    data: ClientMessageData,
    at: 'end' | 'start'
  } = $props();
</script>

<div class="message-container {at}">
  <p class="username">{data.username}</p>
  <div class="message {at}">
    {@html data.content}
  </div>
</div>

<style lang="postcss">
  .message-container {
    display: flex;
    flex-direction: column;
    width: 100%;

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

    & :global(img) {
      margin: 0;
      border-radius: 6px;
    }

    & :global(h1),
    & :global(h2),
    & :global(h3),
    & :global(h4),
    & :global(h5),
    & :global(h6),
    & :global(pre),
    & :global(li),
    & :global(p) {
      max-width: 100%;
      overflow-wrap: anywhere;
      margin: 0;
    }

    & :global(ul),
    & :global(ol) {
      padding-left: 1.2rem;
      margin: 0;
    }
  }

  :root {
    --m3-card-shape: var(--m3-util-rounding-medium);
  }

  .message {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-radius: var(--m3-card-shape);
    color: rgb(var(--m3-scheme-on-surface));
    background-color: rgb(var(--m3-scheme-surface-container-low));
    box-shadow: var(--m3-util-elevation-1);
    max-width: 100%;

    &.start {
      justify-content: flex-start;
    }

    &.end {
      justify-content: flex-end;
    }
  }
  @media (forced-colors: active) {
    .message {
      outline: solid 0.125rem;
    }
  }
</style>