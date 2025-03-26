<script lang="ts">
  const { children } = $props();
  import './app.pcss';
  import './m3.css';
  import 'normalize.css';
  import { v4 } from 'uuid';
  import "@fontsource/jetbrains-mono"
  import "@fontsource-variable/noto-sans-sc"

  window.crypto.randomUUID = v4 as typeof window.crypto.randomUUID;
</script>

{@render children?.()}

