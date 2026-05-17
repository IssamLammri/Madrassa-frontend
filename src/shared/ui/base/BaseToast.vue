<script setup>
import { computed } from 'vue';
import { CheckCircle2 } from 'lucide-vue-next';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Succès !',
  },
  description: {
    type: String,
    default: "L'action a été effectuée avec succès.",
  },
  position: {
    type: String,
    default: 'bottom-right', // bottom-right | bottom-left | top-right | top-left
  },
});

const toastClasses = computed(() => [
  'base-toast',
  `base-toast--${props.position}`,
]);
</script>

<template>
  <transition name="base-toast-transition">
    <div v-if="visible" :class="toastClasses">
      <div class="base-toast__card">
        <div class="base-toast__icon">
          <CheckCircle2 :size="18" />
        </div>

        <div class="base-toast__content">
          <p class="base-toast__title">
            {{ title }}
          </p>

          <p class="base-toast__description">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.base-toast {
  position: fixed;
  z-index: 100;

  &--bottom-right {
    right: 2.5rem;
    bottom: 2.5rem;
  }

  &--bottom-left {
    left: 2.5rem;
    bottom: 2.5rem;
  }

  &--top-right {
    top: 2.5rem;
    right: 2.5rem;
  }

  &--top-left {
    top: 2.5rem;
    left: 2.5rem;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: 1px solid var(--color-white-soft-border);
    border-radius: 1rem;
    background-color: var(--color-heading);
    color: var(--color-white);
    box-shadow: var(--shadow-tooltip);
    min-width: 20rem;
    max-width: 28rem;
  }

  &__icon {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    background-color: var(--color-primary);
    color: var(--color-white);
  }

  &__content {
    min-width: 0;
  }

  &__title {
    margin: 0 0 0.25rem;
    color: var(--color-white);
    font-size: var(--text-body-sm);
    font-weight: 900;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__description {
    margin: 0;
    color: var(--color-white-soft-text);
    font-size: var(--text-caption);
    font-weight: 500;
    line-height: 1.5;
  }
}

.base-toast-transition-enter-active {
  transition:
      opacity var(--duration-normal) var(--ease-standard),
      transform var(--duration-normal) var(--ease-standard);
}

.base-toast-transition-leave-active {
  transition:
      opacity var(--duration-fast) var(--ease-standard),
      transform var(--duration-fast) var(--ease-standard);
}

.base-toast-transition-enter-from,
.base-toast-transition-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

.base-toast-transition-enter-to,
.base-toast-transition-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>