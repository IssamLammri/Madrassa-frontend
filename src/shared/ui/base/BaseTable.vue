<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  headers: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="base-table">
    <div v-if="title" class="base-table__header">
      <h3 class="base-table__title">
        {{ title }}
      </h3>
    </div>

    <div class="base-table__scroll">
      <table class="base-table__table">
        <thead class="base-table__head">
        <tr class="base-table__head-row">
          <th
              v-for="header in headers"
              :key="header.key"
              class="base-table__head-cell"
              :class="{
                'base-table__head-cell--right': header.align === 'right',
              }"
          >
            {{ header.label }}
          </th>
        </tr>
        </thead>

        <tbody class="base-table__body">
        <slot />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-table {
  overflow: hidden;
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-soft);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--color-border);
    background:
        linear-gradient(
            to bottom,
            color-mix(in srgb, var(--color-bg-cream) 65%, var(--color-white)),
            var(--color-white)
        );
  }

  &__title {
    margin: 0;
    min-width: 0;
    color: var(--color-heading);
    font-size: var(--text-h3);
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__scroll {
    overflow-x: auto;
    width: 100%;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  &__head-row {
    border-bottom: 1px solid var(--color-border);
  }

  &__head-cell {
    padding: 1rem 2rem;
    color: var(--color-body-faint);
    font-size: 10px;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    white-space: nowrap;

    &--right {
      text-align: right;
    }
  }

  &__body {
    :deep(tr) {
      border-bottom: 1px solid var(--color-border);
      transition: background-color var(--duration-fast) var(--ease-standard);

      &:last-child {
        border-bottom: 0;
      }
    }

    :deep(td) {
      padding: 1.25rem 2rem;
      color: var(--color-heading);
      font-size: var(--text-body-sm);
      font-weight: 500;
      line-height: 1.5;
      vertical-align: middle;
    }

    :deep(td.text-right) {
      text-align: right;
    }

    :deep(tr:hover) {
      background-color: color-mix(in srgb, var(--color-bg-cream) 65%, var(--color-white));
    }
  }
}
</style>