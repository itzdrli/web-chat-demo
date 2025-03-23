<script lang="ts">
  import {
    emit,
    CommonWsListener,
    EventSchema,
    type DefaultEvent,
  } from '$lib/ws';
  import {
    type ClientMessageData,
    GETSchema,
    type LoginData,
    LoginSchema, POSTSchema,
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

  let messages = $state<ClientMessageData[]>([]);

  let inputMessage = $state('');

  let inputName = $state('');

  let messageList: HTMLDivElement | null = null;

  let login = $state(false);

  let dialogOpen = $derived(!login);

  WebSocket.prototype.emit = emit;
  const socket = new WebSocket(`wss://${ window.location.host }`);

  let echo = true;

  let waitTimes = 0;

  const eventListener = new CommonWsListener();
  eventListener.register('heartbeat', async (e) => {
    if (e.data.heartbeat == 'pong') {
      echo = true;
    }
  });
  eventListener.register('client-message', async (e) => {
    console.log(e.data.self);
    messages.push(e.data)
    await gotoBottom();
  });

  socket.addEventListener('message',async (e)=>{
    const data = EventSchema.safeParse(JSON.parse(e.data));
    if (data.success) {
      await eventListener.resolve(data.data as DefaultEvent);
    }
  })

  const heartbeatTimer = setInterval(() => {
    try {
      if (echo) {
        waitTimes = 0;
        socket.emit('heartbeat', { heartbeat: 'ping' });
        echo = false;
      } else {
        waitTimes++;
      }
    } catch (e) {
      snackbar({
        message: '连接已断开',
        closable: true,
        timeout: 15000,
      });
      console.error(e);
      clearInterval(heartbeatTimer);
      window.location.reload();
    }
    if (waitTimes > 2) {
      snackbar({
        message: '连接超时',
        closable: true,
        timeout: 15000,
      });
      clearInterval(heartbeatTimer);
      window.location.reload();
    }
  }, 30000);

  let snackbar: (data: SnackbarIn) => void = $state(() => {
  });


  onMount(async () => {
    const res = await fetch('/', {
      method: 'GET',
    });
    const data = await res.json();
    if (data) {
      const get = GETSchema.parse(data);
      inputName = get.user.username;
      messages = get.messages
      login = true;
    }
    await tick()
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight
    }
  });

  async function gotoBottom() {
    await tick()
    if (messageList) {
      console.log(messageList.lastElementChild);
      messageList.lastElementChild?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }

  async function submitName() {
    if (inputName.trim().length < 3) {
      snackbar({
        message: '名称至少需要三个字符',
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
      const user = POSTSchema.parse(data);
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
    socket.emit('server-message', {
      content: inputMessage,
      timestamp: Date.now(),
    });
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
</script>

<main class="container">
  <div class="message-list m3-container" bind:this={messageList}>
    <MessageList messages={messages}/>
  </div>
  <div class="message-input m3-container">
    <ChatInput bind:value={inputMessage} onSubmit={submitMessage}
               uploadImage={async ()=>{snackbar({message: '还没做，先用图床吧'})}}
               disabled={dialogOpen}/>
  </div>
  <div class="user-list">

  </div>
</main>
<Dialog headline="设置名称" bind:open={dialogOpen} closeOnClick={false}
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

    & .message-list, & .message-input {
      padding: 1rem;
    }

    & .message-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      gap: 1rem;
      grid-area: message-list;
      overflow-y: scroll;
      overflow-x: scroll;
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