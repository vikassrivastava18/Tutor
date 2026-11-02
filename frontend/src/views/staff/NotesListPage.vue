<template>
    <div class="note-list">
        <h3 class="me-4">Saved Notes
            <router-link
                class="ms-2"
                :to="`/notes/create-note`">
                <button type="button" 
                    class="btn px-2">
                    <img src="../../assets/create.png" width="20" alt="create list">
                </button>
            </router-link>
        </h3>
        <div class="container mb-2">
            <button v-for="topic in topics" 
            class="btn btn-primary mx-3" :key="topic.id"
            @click="getTopicNotes(topic.id)">
            {{ topic.topic }}</button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <div v-for="note in notes" :key="note.id" class="note-item p-2">
            <div class="container">
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                    <!-- Repeat this column for each note -->
                    <div class="col">
                    <div class="card h-100" id="noteItem">
                        <div class="card-body d-flex flex-column">
                        <h5 class="card-title">
                            <router-link
                                :key="note.id"
                                :to="`/notes/${note.id}`"                                
                                >
                                <h3>{{ note.title }}</h3>
                            </router-link>
                        </h5>
                        <p class="text-muted mb-2">Last Update: 
                            {{ format(note.updated_at) }}</p> 
                        </div>
                    </div>
                    </div>
                    <!-- /repeat -->
                </div>
            </div>
           
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listNotes, listTopics, listTopicNotes } from '../../api'

const notes = ref([])
const topics = ref([])
const error = ref('')


onMounted(load)

async function load() {
    try {
        const res = await listNotes()
        notes.value = res.data
        //  Get the topics
        const top = await listTopics()
        topics.value = top.data

    } catch (e) {
        console.log("Error: ", e);
        
        error.value = 'Failed to load notes'
    }
}

async function getTopicNotes(topicId) {
    const res = await listTopicNotes(topicId)
    notes.value = res.data
}


function format(date) {
    return new Date(date).toLocaleString()
}
</script>


<style scoped>

    .error {
        color: red;
    }
    #noteItem {
        background-color: lightyellow;
    }
    .note-list > h3 {
        text-align: center;
        color: crimson;
    }
</style>