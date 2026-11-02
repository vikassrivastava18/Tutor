<template>
    <div class="note-viewer container" v-if="note" >
        <h3>  {{ note.title }}</h3>

        <div v-for="(block, i) in note.blocks" :key="i" class="p-2 m-2">
            <h4 v-if="block.type === 'heading'" class="p-1">{{ block.content }}</h4>
            <p v-else-if="block.type === 'paragraph'" class="p-1">{{ block.content }}</p>
            <img v-else-if="block.type === 'image'" :src="block.content" class="note-image p-1" />
        </div>
    </div>

    <div v-else class="error">Note not found</div>
</template>

<script setup>
/* eslint-disable */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../api'

const route = useRoute()
const noteId = Number(route.params.noteId) // parse to number
const note = ref(null)

onMounted(load)
async function load() {

  try {
    const token = localStorage.getItem('Authentication-Token')
    const res = await api.get(`/notes/${noteId}/`, {
      headers: { Authorization: `Token ${token}` }
    })
    note.value = res.data
  } catch (e) {
    note.value = null
  }} 
</script>


<style scoped>
  .note-viewer > h3 {
    text-align: center;
    color: crimson;
  }
  .note-image {
      max-width: 450px;
      margin: 10px 0;
      display: block;
  }

  .error {
      color: red;
  }
</style>