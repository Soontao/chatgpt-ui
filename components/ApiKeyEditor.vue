<template>
  <v-list-item v-if="showApiKeyEditor">
    <v-text-field label="Api key" v-model="apiKeyInput" hide-details variant="outlined"></v-text-field>
    <template v-slot:append>
      <v-icon icon="done" size="small" @click="submitApiKey"></v-icon>
      <v-icon icon="close" size="small" @click="showApiKeyEditor = false"></v-icon>
    </template>
  </v-list-item>
  <v-list-item v-else :title="currentApiKey" subtitle="OpenAI API key">
    <template v-slot:append>
      <v-icon icon="edit" @click="showApiKeyEditor = true"></v-icon>
    </template>
  </v-list-item>
</template>

<script setup>
const KEY = "chatgpt-api-key"
const currentApiKey = ref(localStorage.getItem(KEY) ?? "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")
const apiKeyInput = ref(currentApiKey.value)
const showApiKeyEditor = ref(false)
const submitApiKey = async () => {
  localStorage.setItem(KEY, modelNameInput.value)
  currentApiKey.value = apiKeyInput.value
  showApiKeyEditor.value = false
}
</script>

<style scoped>

</style>