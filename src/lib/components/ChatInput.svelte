<script lang="ts">
  import { PaperPlaneTilt, FrameCorners, Image } from 'phosphor-svelte';
  import { fade } from 'svelte/transition';

  interface ChatInputProps {
    value: string,
    onSubmit?: () => void,
    uploadImage?: (image: File) => Promise<void>
    disabled?: boolean
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !multiLine) {
      onSubmit?.();
    }
  }

  let {
    value = $bindable(),
    onSubmit,
    uploadImage,
    disabled = false,
  }: ChatInputProps = $props();

  let multiLine = $state(false);

  async function onPaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          await uploadImage?.(item.getAsFile()!);
          break;
        }
      }
    }
  }

  async function selectImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      disabled = true;
      await uploadImage?.(input.files![0]);
      disabled = false;
    };
    input.click();
  }
</script>

<div class="input-container {multiLine ? 'multi-line' : ''}">
  {#if multiLine}
    <textarea autocomplete="off" bind:value={value}
              onsubmit={() => onSubmit?.()} onkeydown={onKeyDown}
              disabled={disabled} placeholder="说点什么吧..."
              onpaste={onPaste}></textarea>
  {:else}
    <input autocomplete="off" type="text" bind:value={value}
           onsubmit={() => onSubmit?.()} onkeydown={onKeyDown}
           disabled={disabled} placeholder="说点什么吧..."
           onpaste={onPaste}>
  {/if}
  <button class="b1" onclick={() => multiLine = !multiLine} disabled={disabled}>
    <FrameCorners size="1.5rem"/>
  </button>
  <button class="b2" onclick={() => onSubmit?.()} disabled={disabled}>
    <PaperPlaneTilt size="1.5rem"/>
  </button>
  {#if multiLine}
    <button class="b3" onclick={selectImage} disabled={disabled}
            in:fade={{duration:100}} out:fade={{duration:100}}>
      <Image size="1.5rem"/>
    </button>
  {/if}
</div>

<style lang="postcss">
  .input-container {
    display: grid;
    background-color: rgb(var(--m3-scheme-surface-container-highest));
    border-radius: 12px;
    height: 3.5rem;
    overflow: hidden;
    transition: height 0.2s ease;
    grid-template:
        "i b1 b2" auto
        "i b3 b4" auto
        "i - -" 1fr/ 1fr auto auto;

    & .b1 {
      grid-area: b1;
    }

    & .b2 {
      grid-area: b2;
    }

    & .b3 {
      grid-area: b3;
    }

    &.multi-line {
      height: 10rem;
    }

    &:focus-within {
      outline: 3px solid rgb(var(--m3-scheme-surface-variant));
    }

    & > * {
      background: transparent;
      border: 0;
      color: rgb(var(--m3-schema-on-surface));
    }

    & input, & textarea {
      grid-area: i;
      flex-grow: 1;
      outline: none;
      color: rgb(var(--m3-schema-on-surface));
      height: 100%;
      box-sizing: border-box;
      padding: 1rem;
      resize: none;
    }

    & button {
      padding: 0.7rem;
      margin: 0.3rem 0.3rem 0.3rem 0;
      vertical-align: middle;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      transition: background-color 0.2s ease-in-out;

      &:hover {
        background-color: rgb(var(--m3-scheme-surface-variant));
      }

      border-radius: var(--m3-card-shape);
    }
  }
</style>