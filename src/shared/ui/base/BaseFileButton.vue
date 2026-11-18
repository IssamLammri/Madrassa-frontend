<script setup>
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';

const props = defineProps({
  label: {
    type: String,
    default: 'Choisir un fichier',
  },
  variant: {
    type: String,
    default: 'tertiary',
  },
});

const emit = defineEmits(['file-selected']);

const inputRef = ref(null);

const openFilePicker = () => {
  inputRef.value.click();
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    emit('file-selected', file);
    e.target.value = '';
  }
};
</script>

<template>
  <div class="base-file-button">
    <input
      ref="inputRef"
      type="file"
      class="base-file-button__input"
      @change="handleFileChange"
    />

    <button
      type="button"
      :class="['custom-btn', `btn-${variant}`]"
      @click="openFilePicker"
    >
      <Upload :size="18" />
      <span>{{ label }}</span>
    </button>
  </div>
</template>

<style scoped>
.base-file-button { min-width: 0; }
.base-file-button__input { display: none; }
.base-file-button button { max-width: 100%; text-align: start; }
</style>
