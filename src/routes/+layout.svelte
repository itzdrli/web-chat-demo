<script lang="ts">
  const { children } = $props();
  import './app.pcss';
  import 'normalize.css';
  import { v4 } from 'uuid';

  window.crypto.randomUUID = v4 as typeof window.crypto.randomUUID;
</script>

{@render children?.()}

