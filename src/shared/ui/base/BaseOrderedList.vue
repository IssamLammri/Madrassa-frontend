<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <ol class="base-ordered-list">
    <li
        v-for="(item, index) in items"
        :key="item"
        class="base-ordered-list__item"
    >
      <span class="base-ordered-list__index">
        {{ index + 1 }}
      </span>

      <span class="base-ordered-list__text">
        {{ item }}
      </span>
    </li>
  </ol>
</template>

<style lang="scss" scoped>
.base-ordered-list {
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

  &__index {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill);
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
    color: var(--color-primary);
    background-color: var(--color-success-bg);
    border: 1px solid var(--color-success-border);
  }

  &__text {
    min-width: 0;
  }
}
</style>