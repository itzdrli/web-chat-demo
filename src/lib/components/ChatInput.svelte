<script lang="ts">
  import { PaperPlaneTilt } from 'phosphor-svelte';

  interface ChatInputProps {
    value: string,
    onSubmit?: () => void,
    disabled?: boolean
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      onSubmit?.();
    }
  }

  let {
    value = $bindable(),
    onSubmit,
    disabled = false,
  }: ChatInputProps = $props();
</script>

<div class="input-container m3-container">
  <input autocomplete="off" type="text" bind:value={value}
         onsubmit={() => onSubmit?.()} onkeydown={onKeyDown}
         disabled={disabled}>
  <button onclick={() => onSubmit?.()} disabled={disabled}>
    <PaperPlaneTilt size="1.5rem"/>
  </button>
</div>

<style lang="postcss">
  .input-container {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
    background-color: rgb(var(--m3-scheme-surface-container-highest));
    border-radius: 12px;

    &:focus-within {
      outline: 3px solid rgb(var(--m3-scheme-surface-variant));
    }

    & > * {
      background: transparent;
      border: 0;
      color: rgb(var(--m3-schema-on-surface));
    }

    & input {
      flex-grow: 1;
      outline: none;
      color: rgb(var(--m3-schema-on-surface));
      margin: 1rem;
    }

    & button {
      padding: 0.7rem;
      margin: 0.3rem;
      vertical-align: middle;
      display: flex;
      flex-direction: row;
      gap: 0.3rem;
      justify-content: center;
      align-items: center;

      &:hover {
        background-color: rgb(var(--m3-scheme-surface-variant));
      }

      border-radius: var(--m3-card-shape);
    }
  }
</style>