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

    & :global(img) {
      margin: 0;
      border-radius: 6px;
      object-fit: cover;
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
      color: rgb(var(--m3-scheme-on-surface));
    }

    & :global(pre),
    & :global(p),
    & :global(span),
    & :global(a),
    & :global(li) {
      line-height: 1.2rem;
      font-size: 1.1rem;
    }

    & :global(ul),
    & :global(ol) {
      padding-left: 1.2rem;
      margin: 0;
    }

    & :global(img) {
      max-width: 100%;
    }

    & :global(p code) {
      background-color: rgb(var(--inline-code-background));
      color: var(--inline-code-color);
      padding: 0.25rem 0.5rem 0.25rem 0.5rem;
      margin: 0 0.25rem 0 0.25rem;
      border-radius: 6px;
    }


    & :global(p code:first-child) {
      margin-left: 0;
    }

    & :global(p code:last-child) {
      margin-right: 0;
    }

    & :global(a) {
      color: rgb(var(--m3-scheme-primary));
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 1px;
    }

    & :global(blockquote) {
      background-color: rgb(var(--m3-scheme-surface-container-high));
      margin: 0;
      padding: 0.5rem;
      border-radius: var(--m3-card-shape);
      border-left: solid 5px rgb(var(--m3-scheme-primary-container));
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  :root {
    --m3-card-shape: var(--m3-util-rounding-medium);
  }

  .message {
    min-height: 2.8rem;
    max-width: 80%;
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    gap: 0.5rem;
    border-radius: var(--m3-card-shape);
    color: rgb(var(--m3-scheme-on-surface));
    background-color: rgb(var(--m3-scheme-surface-container-low));
    box-shadow: var(--m3-util-elevation-1);

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