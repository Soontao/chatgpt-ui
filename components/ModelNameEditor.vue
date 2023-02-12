<template>
  <v-list-item v-if="showModelNameEditor">
    <v-text-field label="Model name" v-model="modelNameInput" hide-details variant="outlined"></v-text-field>
    <template v-slot:append>
      <v-icon icon="done" size="small" @click="submitModelName"></v-icon>
      <v-icon icon="close" size="small" @click="showModelNameEditor = false"></v-icon>
    </template>
  </v-list-item>
  <v-list-item v-else :title="currentModelName" subtitle="Current model">
    <template v-slot:append>
      <v-icon icon="edit" @click="showModelNameEditor = true"></v-icon>
    </template>
  </v-list-item>
</template>

<script setup>
import { CHAT_GPT } from '~~/constants';

const currentModelName = ref(localStorage.getItem(CHAT_GPT.MODEL_NAME) ?? CHAT_GPT.DEFAULT_MODEL)
const modelNameInput = ref(currentModelName.value)
const showModelNameEditor = ref(false)
const submitModelName = async () => {
  localStorage.setItem(CHAT_GPT.MODEL_NAME, modelNameInput.value)
  currentModelName.value = modelNameInput.value
  showModelNameEditor.value = false
}
</script>

<style scoped>

</style>