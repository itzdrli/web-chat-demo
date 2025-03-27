<script lang="ts">
  import {
    emit,
    CommonWsListener,
    EventSchema,
    type DefaultEvent,
  } from '$lib/ws';
  import {
    type BroadcastMessage,
    GETSchema, ImagePOSTResponseSchema, POSTResponseSchema,
  } from '$lib';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import MessageList from '$lib/components/MessageList.svelte';
  import {
    Dialog,
    Button,
    TextFieldOutlined,
    Snackbar,
    type SnackbarIn,
  } from 'm3-svelte';
  import { onMount, tick } from 'svelte';

  let inputOnLoading = $state(false);

  let messages = $state<BroadcastMessage[]>([]);

  let inputMessage = $state('');

  let inputName = $state('');

  let list: MessageList | null = null;

  let userExists = $state(true);

  let echo = true;

  let waitTimes = 0;

  let snackbar: (data: SnackbarIn) => void = $state(() => {
  });

  let forceScroll = true;

  const eventListener = new CommonWsListener();
  eventListener.register('heartbeat', async (e) => {
    if (e.data.heartbeat == 'pong') {
      echo = true;
    }
  });
  eventListener.register('receive-message', async (e) => {
    messages.push(e.data);
    await list?.gotoBottomSmooth();
  });

  let socket: WebSocket | null = null;

  WebSocket.prototype.emit = emit;

  let heartbeatTimer: number | null = null;

  function initSocket() {
    socket?.close();
    socket = new WebSocket(`wss://${ window.location.host }`);
    socket.addEventListener('message', async (e) => {
      const data = EventSchema.safeParse(JSON.parse(e.data));
      if (data.success) {
        await eventListener.resolve(data.data as DefaultEvent);
      }
    });
    initHeartbeat();
  }

  function initHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer =
      setInterval(async () => {
        try {
          if (echo) {
            waitTimes = 0;
            socket?.emit('heartbeat', { heartbeat: 'ping' });
            echo = false;
          } else {
            waitTimes++;
          }
        } catch (e) {
          snackbar({
            message: '连接已断开, 尝试重连',
            closable: true,
            timeout: 15000,
          });
          console.error(e);
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          await reload();
        }
        if (waitTimes > 3) {
          snackbar({
            message: '连接超时, 尝试重连',
            closable: true,
            timeout: 15000,
          });
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          await reload();
        }
      }, 20000) as unknown as number;
  }

  function clearSocket() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    socket?.close();
    socket = null;
  }

  async function initMessages() {
    const res = await fetch('/', {
      method: 'GET',
    });
    const data = await res.json();
    if (data) {
      const get = GETSchema.parse(data);
      messages = get.messages;
      userExists = get.exists;
    }
    await list?.gotoBottom(forceScroll);
    forceScroll = false;
  }

  async function reload() {
    initSocket();
    await initMessages();
  }

  window.document.addEventListener('visibilitychange', (_) => {
    if (document.visibilityState == 'hidden') {
      clearSocket();
    }
    if (document.visibilityState == 'visible') {
      reload();
    }
  });

  onMount(async () => {
    await reload();
  });

  async function submitName() {
    if (inputName.trim().length < 3) {
      snackbar({
        message: '名称至少需要三个字符',
        closable: true,
        timeout: 3000,
      });
      return;
    }
    if (inputName.trim().length > 20) {
      snackbar({
        message: '名称不能超过20个字符',
        closable: true,
        timeout: 3000,
      });
      return;
    }
    const body = {
      username: inputName,
    };
    const res = await fetch('/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data) {
      const user = POSTResponseSchema.parse(data);
      inputName = user.username;
    }
    window.location.reload();
  }

  const submitMessage = async () => {
    if (inputMessage.trim().length < 1) {
      snackbar({
        message: '别发空消息',
        closable: true,
        timeout: 3000,
      });
      return;
    }
    socket?.emit('send-message', inputMessage);
    inputMessage = '';
    await tick();
  };

  function whenEnter(func: () => void) {
    return (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        func();
      }
    };
  }

  async function uploadImage(image: File) {
    snackbar({
      message: '上传中...',
      timeout: 1500,
      closable: true,
    });
    inputOnLoading = true;
    const formData = new FormData();
    formData.append('image', image);
    const res = await fetch('/image', {
      method: 'POST',
      body: formData,
    });
    const data = ImagePOSTResponseSchema.safeParse(await res.json());
    if (data.success) {
      console.log(data);
      if (data.data.success) {
        inputMessage += `![${ image.name }](${ data.data.url })`;
      }
    }
    inputOnLoading = false;
  }
</script>

<main class="container">

  <div class="message-input">
    <ChatInput bind:value={inputMessage} onSubmit={submitMessage}
               uploadImage={uploadImage}
               disabled={!userExists}
               onLoading={inputOnLoading}/>
  </div>
  <MessageList {messages} bind:this={list}></MessageList>
  <div class="user-list">

  </div>
</main>
<Dialog headline="设置名称" open={!userExists} closeOnClick={false}
        closeOnEsc={false}>
  <div class="dialog-content">
    <span>此名称并不重要，只是为了展示</span>
    <TextFieldOutlined name="name" bind:value={inputName}
                       extraOptions={{onkeydown: whenEnter(submitName), autocomplete: 'off'}}></TextFieldOutlined>
  </div>
  <svelte:fragment slot="buttons">
    <Button type="tonal" on:click={submitName}>OK</Button>
  </svelte:fragment>
</Dialog>
<Snackbar bind:show={snackbar}/>

<style lang="postcss">
  .container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template:
        "user-list message-list" 1fr
        "user-list message-input" auto / auto 1fr;

    & .message-input {
      padding: 1rem;
      box-sizing: border-box;
    }


    & .message-input {
      grid-area: message-input;
    }

    & .user-list {
      grid-area: user-list;
      background: azure;
    }
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    & :global(label) {
      background-color: rgb(var(--m3-scheme-surface-container-high));
    }
  }
</style>