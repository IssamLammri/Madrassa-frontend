<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <ul class="base-bullet-list">
    <li
        v-for="item in items"
        :key="item"
        class="base-bullet-list__item"
    >
      <span class="base-bullet-list__dot"></span>
      <span class="base-bullet-list__text">{{ item }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.base-bullet-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-body);
    font-size: var(--text-body-sm);
    line-height: 1.5;
  }

  &__dot {
    width: 0.375rem;
    height: 0.375rem;
    flex-shrink: 0;
    border-radius: 50%;
    background-color: var(--color-primary);
  }

  &__text {
    min-width: 0;
  }
}
</style>