<script setup>
import { fetchEventSource } from '@microsoft/fetch-event-source'
import ApiKeyEditor from "./components/ApiKeyEditor";
import { CHAT_GPT } from './constants';

const runtimeConfig = useRuntimeConfig()
const fetchingResponse = ref(false)
const fetchReply = async (message, parentMessageId) => {
  const ctrl = new AbortController()
  try {
    await fetchEventSource('/api/conversation', {
      signal: ctrl.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        parentMessageId: parentMessageId,
        conversationId: currentConversation.value.id,
        modelName: localStorage.getItem(CHAT_GPT.MODEL_NAME) ?? CHAT_GPT.DEFAULT_MODEL,
        apiKey: localStorage.getItem(CHAT_GPT.API_KEY) ?? ""
      }),
      onopen(response) {
        if (response.status === 200) {
          return;
        }
        throw new Error(`Failed to send message. HTTP ${response.status} - ${response.statusText}`);
      },
      onclose() {
        throw new Error(`Failed to send message. Server closed the connection unexpectedly.`);
      },
      onerror(err) {
        throw err;
      },
      onmessage(message) {
        if (message.event === 'error') {
          throw new Error(JSON.parse(message.data).error);
        }
        const { type, data } = JSON.parse(message.data);
        if (type === 'done') {
          if (currentConversation.value.id === null) {
            currentConversation.value.id = data.conversationId
          }
          currentConversation.value.messages[currentConversation.value.messages.length - 1].id = data.messageId
          ctrl.abort();
          fetchingResponse.value = false
          return;
        }
        if (currentConversation.value.messages[currentConversation.value.messages.length - 1].from === 'ai') {
          currentConversation.value.messages[currentConversation.value.messages.length - 1].message += data
        } else {
          currentConversation.value.messages.push({ id: null, from: 'ai', message: data })
        }
        scrollChatWindow()
      },
    })
  } catch (err) {
    ctrl.abort()
    showSnackbar(err.message)
    fetchingResponse.value = false
  }
}

const theme = ref('dark')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const defaultConversation = ref({
  id: null,
  messages: []
})
const currentConversation = ref({})

const grab = ref(null)
const scrollChatWindow = () => {
  grab.value.scrollIntoView({ behavior: 'smooth' })
}

const createNewConversation = () => {
  currentConversation.value = Object.assign(defaultConversation.value, {
  })
}
const send = (message) => {
  fetchingResponse.value = true
  let parentMessageId = null
  if (currentConversation.value.messages.length > 0) {
    const lastMessage = currentConversation.value.messages[currentConversation.value.messages.length - 1]
    if (lastMessage.from === 'ai' && lastMessage.id !== null) {
      parentMessageId = lastMessage.id
    }
  }
  currentConversation.value.messages.push({ from: 'me', parentMessageId: parentMessageId, message: message })
  fetchReply(message, parentMessageId)
  scrollChatWindow()
}
const stop = () => {
  ctrl.abort();
  fetchingResponse.value = false
}

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text) => {
  snackbarText.value = text
  snackbar.value = true
}

onNuxtReady(() => {
  createNewConversation()
})

const drawer = ref(false)

</script>

<template>
  <v-app :theme="theme">
    <v-app-bar prominent>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>(华创传媒志国) ChatGPT UI</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" theme="dark" temporary="">
      <v-list>
        <ModelNameEditor />
        <ApiKeyEditor />
      </v-list>

      <template v-slot:append>
        <v-divider></v-divider>
        <v-list>
          <!--          <v-list-item title="Clear conversations"></v-list-item>-->
          <v-list-item :prepend-icon="theme === 'light' ? 'dark_mode' : 'light_mode'"
            :title="(theme === 'light' ? 'Dark' : 'Light') + ' mode'" @click="toggleTheme"></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
    <v-main>
      <div ref="chatWindow">
        <v-card rounded="0" elevation="0" v-for="(conversation, index) in currentConversation.messages" :key="index"
          :variant="conversation.from === 'ai' ? 'tonal' : ''">
          <v-container>
            <v-card-text class="text-caption text-disabled">{{ conversation.from }}</v-card-text>
            <v-card-text>
              <MsgContent :content="conversation.message" />
            </v-card-text>
          </v-container>
          <v-divider></v-divider>
        </v-card>
        <div ref="grab" class="w-100" style="height: 150px;"></div>
      </div>
      <v-container>
      </v-container>
    </v-main>
    <v-footer app class="d-flex flex-column">
      <div class="w-100 d-flex align-center">
        <v-btn v-show="fetchingResponse" icon="close" title="stop" @click="stop"></v-btn>
        <MsgEditor :send-message="send" :disabled="fetchingResponse" :loading="fetchingResponse" />
      </div>

      <div class="px-4 py-2 text-disabled text-caption font-weight-light text-center w-100">
        {{ new Date().getFullYear() }} — {{ runtimeConfig.public.appName }}
      </div>
    </v-footer>
    <v-snackbar v-model="snackbar" multi-line>
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn color="red" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>