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
      :class="['file-btn', `btn-${variant}`]"
      @click="openFilePicker"
    >
      <Upload :size="18" />
      <span>{{ label }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.base-file-button {
  display: inline-block;

  &__input {
    display: none;
  }
}

.file-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: auto;

  &.btn-primary {
    background-color: var(--color-primary);
    color: white;
    &:hover {
      background-color: var(--color-primary-hover);
      transform: translateY(-1px);
    }
  }

  &.btn-secondary {
    background-color: var(--color-heading);
    color: white;
    &:hover { opacity: 0.9; }
  }

  &.btn-tertiary {
    background-color: transparent;
    border: 2px solid var(--color-border);
    color: var(--color-heading);
    &:hover { background-color: var(--color-bg-cream); }
  }
}
</style>
