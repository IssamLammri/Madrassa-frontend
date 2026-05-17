<script setup>
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';

const props = defineProps({
  title: {
    type: String,
    default: 'Cliquez ou glissez un fichier',
  },
  description: {
    type: String,
    default: 'PDF, DOCX ou TXT — Max 10MB',
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
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    emit('file-selected', file);
  }
};

const handleDragOver = (e) => {
  e.preventDefault();
};
</script>

<template>
  <div
      class="base-file-drop"
      @click="openFilePicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
  >
    <input
        ref="inputRef"
        type="file"
        class="base-file-drop__input"
        @change="handleFileChange"
    />

    <div class="base-file-drop__icon">
      <Upload :size="24" />
    </div>

    <p class="base-file-drop__title">
      {{ title }}
    </p>

    <p class="base-file-drop__description">
      {{ description }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.base-file-drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 2rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-card);
  background-color: color-mix(in srgb, var(--color-bg-cream) 60%, transparent);
  cursor: pointer;
  text-align: center;
  transition:
      background-color var(--duration-normal) var(--ease-standard),
      border-color var(--duration-normal) var(--ease-standard),
      transform var(--duration-normal) var(--ease-standard);

  &:hover {
    background-color: var(--color-bg-cream);
    border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  }

  &__input {
    display: none;
  }

  &__icon {
    width: 3.5rem;
    height: 3.5rem;
    margin-bottom: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill);
    background-color: var(--color-white);
    box-shadow: var(--shadow-soft);
    color: var(--color-body-ultra-faint);
    transition: color var(--duration-normal) var(--ease-standard);
  }

  &:hover &__icon {
    color: var(--color-primary);
  }

  &__title {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 900;
  }

  &__description {
    margin: 0.25rem 0 0;
    color: var(--color-body);
    font-size: var(--text-caption);
  }
}
</style>