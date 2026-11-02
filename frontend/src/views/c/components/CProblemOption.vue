<template>
  <button
    type="button"
    class="btn problem-option text-start w-100 h-100"
    :class="selected ? 'btn-success' : 'btn-outline-light'"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="emit('select', problem)"
  >
    <span class="d-block fw-semibold text-white">{{ problem.title }}</span>
    <span class="d-block small text-white">{{ problem.summary }}</span>
  </button>
</template>

<script setup>
/* global defineProps, defineEmits */
import { onMounted } from "vue";

const props = defineProps({
  problem: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["select"]);

onMounted(() => {
  if (props.selected) {
    emit("select", props.problem);
  }
});
</script>
