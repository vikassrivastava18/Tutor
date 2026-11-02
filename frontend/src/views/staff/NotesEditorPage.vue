
<template>
  <div class="note-editor">
    <div class="editor-column">
      <h2>Create a new note</h2>

      <label class="field-label">Select Topic</label>
      <select v-model="selectedTopic" class="type-select">
        <option v-for="(topic, idx) in topics" :value="topic.id"
                :key="idx">{{ topic.topic }}</option>
      </select>
      <label class="field-label">Title</label>
      <input class="input title-input" v-model="title" placeholder="Note title" />

      <div class="blocks">
        <div v-for="(block, idx) in blocks" :key="idx" class="block">
          <div class="block-header">
            <select v-model="block.type" class="type-select">
              <option value="heading">Heading</option>
              <option value="paragraph">Paragraph</option>
              <option value="image">Image (URL)</option>
            </select>
            <div class="block-actions">
              <button class="btn btn-danger" @click="removeBlock(idx)">Remove</button>
            </div>
          </div>

          <div v-if="block.type === 'heading'">
            <input class="input" v-model="block.content" placeholder="Heading text" />
          </div>

          <div v-else-if="block.type === 'paragraph'">
            <textarea class="textarea" v-model="block.content" placeholder="Paragraph text"></textarea>
          </div>

          <div v-else-if="block.type === 'image'">
            <div v-if="!block.content" class="image-inputs">
              <input type="file" @change="onFileChange($event, idx)" />
              <small class="muted">Or paste an image URL below</small>
              <input class="input" v-model="block.content" placeholder="Image URL" />
            </div>
            <div v-else class="image-preview">
              <img :src="block.content" alt="image" />
            </div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button class="btn" @click="addBlock('heading')">Add Heading</button>
        <button class="btn" @click="addBlock('paragraph')">Add Paragraph</button>
        <button class="btn" @click="addBlock('image')">Add Image</button>
      </div>

      <div class="save-row">
        <button class="btn btn-primary" @click="saveNote">Save Note</button>
        <div class="status">
          <span v-if="saving" class="pill">Saving…</span>
          <span v-if="saved" class="pill success">Saved!</span>
          <span v-if="saveError" class="pill error">{{ saveError }}</span>
        </div>
      </div>
    </div>

    <div class="preview-column">
      <h3>Preview</h3>

      <div class="preview">
        <h1 class="preview-title">{{ title || 'Untitled' }}</h1>
        <div v-for="(b, i) in blocks" :key="i" class="preview-block">
          <h2 v-if="b.type === 'heading'">{{ b.content }}</h2>
          <p v-else-if="b.type === 'paragraph'">{{ b.content }}</p>
          <img v-else-if="b.type === 'image'" :src="b.content" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { uploadImage, createNote, listTopics} from '../../api'

// ...existing code...
const title = ref('')
const topics = ref([])
const selectedTopic = ref('')
const blocks = ref([])
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)
const error = ref('')

onMounted(loadTopics)
async function loadTopics() {
  try {
    const res = await listTopics()
    topics.value = res.data
  } catch (e) {
      error.value = 'Failed to load notes';
  }
}


function addBlock(type = 'paragraph') {
  blocks.value.push({ type, content: '' })
}

function removeBlock(index) {
  blocks.value.splice(index, 1)
}

async function onFileChange(event, index) {
  const file = event.target.files[0]
  if (!file) return
  try {
    saving.value = true
    const res = await uploadImage(file)
    // API returns { id, url }
    blocks.value[index].content = res.url
  } catch (err) {
    console.error(err)
    alert('Image upload failed')
  } finally {
    saving.value = false
  }
}

async function saveNote() {
  saveError.value = ''
  saved.value = false
  saving.value = true
  try {
    const payload = {
      title: title.value,
      blocks: blocks.value,
      topic: selectedTopic.value
    }
    await createNote(payload)
    saved.value = true
    // optionally reset
    title.value = ''
    blocks.value = []
  } catch (err) {
    console.error(err)
    saveError.value = err?.response?.data || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.note-editor {
  max-width: 1100px;
  margin: 1.25rem auto;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 28px;
  align-items: start;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Columns */
.editor-column {
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(19,24,28,0.06);
  border: 1px solid #ececec;
}
.preview-column {
  position: sticky;
  top: 20px;
}

/* Labels & inputs */
.field-label { display:block; margin-bottom:6px; font-weight:600; color:#333 }
.input, .textarea, .type-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #dcdcdc;
  background: #fff;
  font-size: 14px;
  margin-bottom: 8px;
}
.title-input { font-size: 16px; font-weight:600; margin-bottom:12px }
.textarea { min-height: 80px; resize: vertical; }

/* Blocks */
.block { border: 1px solid #eef0f2; padding: 12px; margin: 12px 0; border-radius:6px; background:#fafafa }
.block-header { display:flex; gap:8px; align-items:center; justify-content:space-between; margin-bottom:8px }
.block-actions { display:flex; gap:8px; align-items:center }

/* Buttons */
.btn {
  padding: 8px 12px;
  border: 1px solid transparent;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-weight:600;
}
.btn:hover { filter: brightness(0.97) }
.btn-primary {
  background: linear-gradient(180deg,#2563eb,#1d4ed8);
  color: #fff;
  border: none;
}
.btn-danger {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid rgba(185,28,28,0.08);
}

/* Controls and save row */
.controls { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap }
.save-row { display:flex; gap:12px; align-items:center; margin-top:12px; flex-wrap:wrap }
.status { display:flex; gap:8px; align-items:center }
.pill { padding:6px 10px; border-radius:999px; background:#f3f4f6; font-size:13px }
.pill.success { background:#ecfdf5; color:#065f46; border:1px solid #bbf7d0 }
.pill.error { background:#fff1f2; color:#9f1239; border:1px solid #fecaca }

/* Preview */
.preview-column .preview {
  background:#ffffff;
  border:1px solid #eef2f7;
  padding:16px;
  border-radius:8px;
  box-shadow: 0 6px 18px rgba(11,15,19,0.04);
}
.preview-title { font-size:20px; margin:0 0 10px 0; color:#111827 }
.preview-block { margin-bottom:12px }
.preview img { max-width:100%; border-radius:6px; display:block; }

/* Image inputs & previews */
.image-inputs small.muted { display:block; color:#6b7280; margin:6px 0 }
.image-preview img { max-width:300px; border-radius:6px; display:block }

/* Responsive */
@media (max-width: 960px) {
  .note-editor { grid-template-columns: 1fr; padding: 0 12px }
  .preview-column { position: static; }
}
</style>
