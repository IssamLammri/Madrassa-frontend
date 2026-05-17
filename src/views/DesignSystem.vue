<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Palette,
  Type,
  Layout,
  Component,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Table as TableIcon,
  Download,
  AlertTriangle,
  Bell,
  HelpCircle,
  CheckSquare,
  Tag,
  MousePointerClick,
  ArrowRight,
  Mail,
  Settings,
  Sparkles,
} from 'lucide-vue-next';

import BaseSectionHeader from '@/shared/ui/base/BaseSectionHeader.vue';
import BaseCard from '@/shared/ui/base/BaseCard.vue';
import BaseButton from '@/shared/ui/base/BaseButton.vue';
import BaseBadge from '@/shared/ui/base/BaseBadge.vue';
import BaseTag from '@/shared/ui/base/BaseTag.vue';
import BaseInput from '@/shared/ui/base/BaseInput.vue';
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue';
import BaseSelect from '@/shared/ui/base/BaseSelect.vue';
import BaseRange from '@/shared/ui/base/BaseRange.vue';
import BaseCheckbox from '@/shared/ui/base/BaseCheckbox.vue';
import BaseRadio from '@/shared/ui/base/BaseRadio.vue';
import BaseSwitch from '@/shared/ui/base/BaseSwitch.vue';
import BaseFileUpload from '@/shared/ui/base/BaseFileUpload.vue';
import BaseDateInput from '@/shared/ui/base/BaseDateInput.vue';
import BaseFieldset from '@/shared/ui/base/BaseFieldset.vue';
import BaseAlert from '@/shared/ui/base/BaseAlert.vue';
import BaseToast from '@/shared/ui/base/BaseToast.vue';
import BaseTable from '@/shared/ui/base/BaseTable.vue';
import BaseTooltip from '@/shared/ui/base/BaseTooltip.vue';
import BasePopover from '@/shared/ui/base/BasePopover.vue';
import BaseBulletList from '@/shared/ui/base/BaseBulletList.vue';
import BaseOrderedList from '@/shared/ui/base/BaseOrderedList.vue';

const { t } = useI18n();

const isEnabled = ref(false);
const checkboxValue = ref(true);
const radioValue = ref('on');

const sliderValue = ref(50);
const temperature = ref(35);
const topP = ref(80);
const selectedModel = ref('GPT-4o');
const dateValue = ref('');
const textValue = ref('');
const textareaValue = ref('');
const errorValue = ref('Valeur incorrecte');
const showToast = ref(false);

const colors = computed(() => [
  {
    name: t('design_system.color_primary_name'),
    hex: '#00c896',
    tone: 'primary',
    textTone: 'heading',
    usage: t('design_system.color_primary_usage'),
  },
  {
    name: t('design_system.color_accent_name'),
    hex: '#D66A81',
    tone: 'accent',
    textTone: 'heading',
    usage: t('design_system.color_accent_usage'),
  },
  {
    name: t('design_system.color_heading_name'),
    hex: '#2D3239',
    tone: 'heading',
    textTone: 'white',
    usage: t('design_system.color_heading_usage'),
  },
  {
    name: t('design_system.color_body_name'),
    hex: '#5A616A',
    tone: 'body',
    textTone: 'white',
    usage: t('design_system.color_body_usage'),
  },
]);

const neutrals = computed(() => [
  {
    name: t('design_system.neutral_white_name'),
    hex: '#FFFFFF',
    tone: 'white',
    usage: t('design_system.neutral_white_usage'),
  },
  {
    name: t('design_system.neutral_cream_name'),
    hex: '#F9F8F6',
    tone: 'bg-cream',
    usage: t('design_system.neutral_cream_usage'),
  },
  {
    name: t('design_system.neutral_input_name'),
    hex: '#F2F1ED',
    tone: 'input-bg',
    usage: t('design_system.neutral_input_usage'),
  },
  {
    name: t('design_system.neutral_border_name'),
    hex: '#E8E7E1',
    tone: 'border',
    usage: t('design_system.neutral_border_usage'),
  },
]);

const modelOptions = computed(() => [
  { label: 'GPT-4o', value: 'GPT-4o' },
  { label: 'Claude', value: 'Claude' },
  { label: 'Gemini', value: 'Gemini' },
]);

const tableHeaders = computed(() => [
  { key: 'name', label: t('design_system.table_head_a') },
  { key: 'value', label: t('design_system.table_head_b') },
  { key: 'status', label: t('design_system.table_status') },
  { key: 'action', label: t('design_system.table_action'), align: 'right' },
]);

const bulletItems = computed(() => [
  t('design_system.bullet_list_item_1'),
  t('design_system.bullet_list_item_2'),
  t('design_system.bullet_list_item_3'),
]);

const orderedItems = computed(() => [
  t('design_system.ordered_list_item_1'),
  t('design_system.ordered_list_item_2'),
  t('design_system.ordered_list_item_3'),
]);

const spacingItems = computed(() => [
  {
    label: t('design_system.spacing_container'),
    code: 'max-w-6xl mx-auto',
  },
  {
    label: t('design_system.spacing_padding'),
    code: 'p-8 à p-10',
  },
  {
    label: t('design_system.spacing_gaps'),
    code: 'gap-8 ou gap-12',
  },
]);

const effectItems = computed(() => [
  {
    label: t('design_system.spacing_shadows'),
    code: 'shadow-soft ou shadow-float',
  },
  {
    label: t('design_system.spacing_transitions'),
    code: 'transition-all',
  },
  {
    label: t('design_system.spacing_hover'),
    code: '',
  },
]);

const triggerToast = () => {
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};
</script>

<template>
  <div class="design-system-page">
    <div class="design-system-page__container">
      <section class="intro">
        <h1 class="page-title">{{ t('design_system.page_title') }}</h1>
        <p class="page-description">
          {{ t('design_system.page_description') }}
        </p>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="Palette"
            :title="t('design_system.section_colors')"
        />

        <div class="section-stack">
          <div class="subsection">
            <h3 class="section-kicker">{{ t('design_system.section_brand_palette') }}</h3>

            <div class="card-grid card-grid--swatches">
              <BaseCard
                  v-for="color in colors"
                  :key="color.name"
                  class="surface-card surface-card--swatch"
                  padding="none"
              >
                <div class="swatch" :class="[`swatch--${color.tone}`, `swatch--text-${color.textTone}`]">
                  <span class="swatch__hex">{{ color.hex }}</span>
                </div>

                <div class="swatch-content">
                  <p class="swatch-content__title">{{ color.name }}</p>
                  <p class="swatch-content__text">{{ color.usage }}</p>
                </div>
              </BaseCard>
            </div>
          </div>

          <div class="subsection">
            <h3 class="section-kicker">{{ t('design_system.section_neutrals') }}</h3>

            <div class="card-grid card-grid--swatches">
              <BaseCard
                  v-for="color in neutrals"
                  :key="color.name"
                  class="surface-card surface-card--swatch"
                  padding="none"
              >
                <div class="swatch" :class="[`swatch--${color.tone}`, 'swatch--text-heading']">
                  <span class="swatch__hex">{{ color.hex }}</span>
                </div>

                <div class="swatch-content">
                  <p class="swatch-content__title">{{ color.name }}</p>
                  <p class="swatch-content__text">{{ color.usage }}</p>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="Type"
            :title="t('design_system.section_typography')"
        />

        <BaseCard class="surface-card surface-card--panel" padding="none">
          <div class="two-columns">
            <div class="subsection">
              <h3 class="section-kicker">{{ t('design_system.typography_title_scale') }}</h3>

              <div class="type-stack">
                <div class="type-sample">
                  <p class="type-sample__display">Display Heading</p>
                  <p class="type-meta">Inter Black / 60px / -0.05em</p>
                </div>

                <div class="type-sample">
                  <p class="type-sample__h1">H1 Page Title</p>
                  <p class="type-meta">Inter Black / 48px / -0.05em</p>
                </div>

                <div class="type-sample">
                  <p class="type-sample__h2">H2 Section Title</p>
                  <p class="type-meta">Inter Black / 36px / -0.03em</p>
                </div>

                <div class="type-sample">
                  <p class="type-sample__h3">H3 Subsection Title</p>
                  <p class="type-meta">Inter Black / 24px / -0.02em</p>
                </div>
              </div>
            </div>

            <div class="subsection">
              <h3 class="section-kicker">{{ t('design_system.typography_body_text') }}</h3>

              <div class="type-stack">
                <div class="type-sample">
                  <p class="type-sample__body-lg">
                    {{ t('design_system.typography_body_large') }}
                  </p>
                  <p class="type-meta">Inter Medium / 18px / 1.6lh</p>
                </div>

                <div class="type-sample">
                  <p class="type-sample__body">
                    {{ t('design_system.typography_body_base') }}
                  </p>
                  <p class="type-meta">Inter Regular / 16px / 1.5lh</p>
                </div>

                <div class="type-sample">
                  <p class="type-sample__body-sm">
                    {{ t('design_system.typography_body_small') }}
                  </p>
                  <p class="type-meta">Inter Regular / 14px / 1.45lh</p>
                </div>

                <div class="type-sample">
                  <p class="type-sample__overline">
                    {{ t('design_system.typography_overline') }}
                  </p>
                  <p class="type-meta">Inter Bold / 11px / 0.2em</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="MousePointerClick"
            :title="t('design_system.section_actions')"
        />

        <div class="two-columns two-columns--cards">
          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.actions_buttons') }}</h3>

            <div class="button-showcase">
              <div class="button-example">
                <BaseButton variant="primary">
                  {{ t('design_system.button_primary') }}
                  <ArrowRight :size="16" />
                </BaseButton>
                <p class="micro-copy">{{ t('design_system.button_primary_help') }}</p>
              </div>

              <div class="button-example">
                <BaseButton variant="secondary">
                  {{ t('design_system.button_secondary') }}
                </BaseButton>
                <p class="micro-copy">{{ t('design_system.button_secondary_help') }}</p>
              </div>

              <div class="button-example">
                <BaseButton variant="tertiary">
                  {{ t('design_system.button_tertiary') }}
                </BaseButton>
                <p class="micro-copy">{{ t('design_system.button_tertiary_help') }}</p>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.actions_badges') }}</h3>

            <div class="stack-md">
              <div class="tag-row">
                <BaseBadge variant="success">
                  <CheckCircle2 :size="12" />
                  {{ t('design_system.badge_active') }}
                </BaseBadge>

                <BaseBadge variant="pending">
                  <Clock :size="12" />
                  {{ t('design_system.badge_pending') }}
                </BaseBadge>

                <BaseBadge variant="alert">
                  <AlertCircle :size="12" />
                  {{ t('design_system.badge_alert') }}
                </BaseBadge>

                <BaseBadge variant="default">
                  {{ t('design_system.badge_draft') }}
                </BaseBadge>
              </div>

              <div class="tag-row">
                <BaseTag :icon="Tag">
                  {{ t('design_system.tag_ai') }}
                </BaseTag>

                <BaseTag :icon="Tag">
                  {{ t('design_system.tag_ethics') }}
                </BaseTag>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="CheckSquare"
            :title="t('design_system.section_forms')"
        />

        <BaseCard class="surface-card surface-card--panel surface-card--form" padding="none">
          <div class="two-columns">
            <div class="subsection">
              <h3 class="section-kicker">{{ t('design_system.forms_text_fields') }}</h3>

              <div class="form-stack">
                <BaseInput
                    v-model="textValue"
                    :label="t('design_system.forms_default_state')"
                    :placeholder="t('design_system.forms_input_placeholder')"
                    :icon="Mail"
                />

                <BaseTextarea
                    v-model="textareaValue"
                    :label="t('design_system.forms_textarea')"
                    :rows="4"
                    :placeholder="t('design_system.forms_textarea_placeholder')"
                />

                <BaseInput
                    v-model="errorValue"
                    :label="t('design_system.forms_error_state')"
                    :error="t('design_system.forms_required_message')"
                />
              </div>
            </div>

            <div class="subsection">
              <h3 class="section-kicker">{{ t('design_system.forms_selection_sliders') }}</h3>

              <div class="form-stack">
                <BaseSelect
                    v-model="selectedModel"
                    :label="t('design_system.forms_select')"
                    :options="modelOptions"
                />

                <div class="field">
                  <label class="field__label">{{ t('design_system.forms_range') }}</label>
                  <BaseRange
                      v-model="sliderValue"
                      :min="0"
                      :max="100"
                      :show-values="false"
                  />
                  <div class="slider-meta">
                    <span>{{ t('design_system.forms_min') }}: 0</span>
                    <span class="slider-meta__value">{{ t('design_system.forms_value') }}: {{ sliderValue }}</span>
                    <span>{{ t('design_system.forms_max') }}: 100</span>
                  </div>
                </div>

                <div class="choice-groups">
                  <div class="choice-group">
                    <BaseCheckbox
                        v-model="checkboxValue"
                        :label="t('design_system.forms_checkbox')"
                    />
                    <BaseCheckbox
                        :model-value="false"
                        :label="t('design_system.forms_inactive')"
                    />
                  </div>

                  <div class="choice-group">
                    <BaseRadio
                        v-model="radioValue"
                        value="on"
                        :label="t('design_system.forms_radio_on')"
                    />
                    <BaseRadio
                        v-model="radioValue"
                        value="off"
                        :label="t('design_system.forms_radio_off')"
                    />
                  </div>

                  <div class="choice-group choice-group--switch">
                    <BaseSwitch
                        v-model="isEnabled"
                        :label="t('design_system.forms_switch')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="two-columns">
            <div class="subsection">
              <h3 class="section-kicker">{{ t('design_system.forms_file_upload') }}</h3>

              <BaseFileUpload
                  :title="t('design_system.forms_file_upload_title')"
                  :description="t('design_system.forms_file_upload_text')"
              />
            </div>

            <div class="subsection">
              <h3 class="section-kicker">{{ t('design_system.forms_date_picker') }}</h3>

              <BaseDateInput
                  v-model="dateValue"
                  :helper="t('design_system.forms_date_help')"
              />
            </div>
          </div>

          <div class="subsection">
            <h3 class="section-kicker">{{ t('design_system.forms_fieldset') }}</h3>

            <BaseFieldset :legend="t('design_system.forms_advanced_settings')">
              <div class="two-columns two-columns--compact">
                <div class="field">
                  <label class="field__label">{{ t('design_system.forms_temperature') }}</label>
                  <BaseRange v-model="temperature" :min="0" :max="100" :show-values="false" />
                  <p class="field__value">{{ t('design_system.forms_value') }} : <span>{{ temperature }}</span></p>
                </div>

                <div class="field">
                  <label class="field__label">{{ t('design_system.forms_top_p') }}</label>
                  <BaseRange v-model="topP" :min="0" :max="100" :show-values="false" />
                  <p class="field__value">{{ t('design_system.forms_value') }} : <span>{{ topP }}</span></p>
                </div>
              </div>
            </BaseFieldset>
          </div>
        </BaseCard>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="Bell"
            :title="t('design_system.section_feedback')"
        />

        <div class="two-columns two-columns--cards">
          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.feedback_toasts') }}</h3>

            <div class="stack-md">
              <BaseButton variant="secondary" @click="triggerToast">
                {{ t('design_system.feedback_trigger_toast') }}
              </BaseButton>

              <p class="body-small">
                {{ t('design_system.feedback_toast_help') }}
              </p>
            </div>
          </BaseCard>

          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.feedback_badges') }}</h3>

            <div class="tag-row">
              <BaseBadge variant="success">
                <CheckCircle2 :size="12" />
                {{ t('design_system.badge_active') }}
              </BaseBadge>

              <BaseBadge variant="alert">
                <AlertCircle :size="12" />
                {{ t('design_system.badge_urgent') }}
              </BaseBadge>

              <BaseBadge variant="dark">
                {{ t('design_system.badge_admin') }}
              </BaseBadge>
            </div>
          </BaseCard>
        </div>

        <div class="subsection">
          <h3 class="section-kicker">{{ t('design_system.feedback_alerts') }}</h3>

          <div class="alert-stack">
            <BaseAlert
                variant="info"
                :icon="Info"
                :title="t('design_system.feedback_info_title')"
                :description="t('design_system.feedback_info_text')"
            />

            <BaseAlert
                variant="warning"
                :icon="AlertTriangle"
                :title="t('design_system.feedback_warning_title')"
                :description="t('design_system.feedback_warning_text')"
            />
          </div>
        </div>

        <BaseToast
            :visible="showToast"
            :title="t('design_system.feedback_success_title')"
            :description="t('design_system.feedback_success_text')"
        />
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="Layout"
            :title="t('design_system.section_cards')"
        />

        <div class="three-columns">
          <BaseCard class="surface-card surface-card--feature" padding="none" hoverable>
            <div class="feature-icon feature-icon--soft">
              <Info :size="24" />
            </div>
            <h4 class="card-title">{{ t('design_system.card_standard_title') }}</h4>
            <p class="body-small">
              {{ t('design_system.card_standard_text') }}
            </p>
          </BaseCard>

          <BaseCard class="surface-card surface-card--emphasis" padding="none">
            <div class="surface-card__glow"></div>
            <div class="surface-card__content">
              <div class="feature-icon feature-icon--dark">
                <Sparkles :size="24" />
              </div>
              <h4 class="card-title card-title--light">{{ t('design_system.card_emphasis_title') }}</h4>
              <p class="body-small body-small--light">
                {{ t('design_system.card_emphasis_text') }}
              </p>
            </div>
          </BaseCard>

          <BaseCard class="surface-card surface-card--placeholder" padding="none">
            <div class="feature-icon feature-icon--neutral">
              <Settings :size="24" />
            </div>
            <h4 class="card-title">{{ t('design_system.card_placeholder_title') }}</h4>
            <p class="body-small">
              {{ t('design_system.card_placeholder_text') }}
            </p>
          </BaseCard>
        </div>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="TableIcon"
            :title="t('design_system.section_tables')"
        />

        <BaseTable
            :title="t('design_system.table_title')"
            :headers="tableHeaders"
        >
          <tr>
            <td>
              <div class="table-main">{{ t('design_system.table_main_item') }}</div>
              <div class="table-sub">{{ t('design_system.table_sub_item') }}</div>
            </td>
            <td>{{ t('design_system.table_descriptive_value') }}</td>
            <td>
              <BaseBadge variant="success">
                <CheckCircle2 :size="10" />
                {{ t('design_system.table_published') }}
              </BaseBadge>
            </td>
            <td class="text-right">
              <BaseButton variant="tertiary" class="icon-button">
                <Download :size="18" :stroke-width="1.5" />
              </BaseButton>
            </td>
          </tr>
        </BaseTable>

        <div class="usage-note">
          <p>
            <span>{{ t('design_system.table_usage_label') }}</span>
            {{ t('design_system.table_usage_text') }}
          </p>
        </div>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="Component"
            :title="t('design_system.section_interactive')"
        />

        <div class="two-columns two-columns--cards">
          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.interactive_tooltips') }}</h3>

            <div class="tooltip-demo">
              <BaseTooltip :text="t('design_system.interactive_tooltip_text')" />
              <span class="body-small body-small--italic">
                {{ t('design_system.interactive_tooltip_hint') }}
              </span>
            </div>
          </BaseCard>

          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.interactive_popover') }}</h3>

            <div class="popover-demo">
              <BasePopover :title="t('design_system.interactive_latest_alerts')">
                <template #trigger>
                  <BaseButton variant="tertiary" class="popover-trigger">
                    <Bell :size="16" />
                    {{ t('design_system.interactive_notifications') }}
                    <span class="popover-trigger__dot"></span>
                  </BaseButton>
                </template>

                <div class="popover-list">
                  <div class="popover-item">
                    <p class="popover-item__title">{{ t('design_system.interactive_alert_item_1') }}</p>
                    <p class="popover-item__time">{{ t('design_system.interactive_alert_time_1') }}</p>
                  </div>

                  <div class="popover-item">
                    <p class="popover-item__title">{{ t('design_system.interactive_alert_item_2') }}</p>
                    <p class="popover-item__time">{{ t('design_system.interactive_alert_time_2') }}</p>
                  </div>
                </div>
              </BasePopover>
            </div>
          </BaseCard>
        </div>

        <BaseCard class="surface-card surface-card--panel" padding="none">
          <h3 class="section-kicker">{{ t('design_system.interactive_lists') }}</h3>

          <div class="two-columns two-columns--compact">
            <div class="subsection">
              <h4 class="mini-heading">{{ t('design_system.bullet_list_title') }}</h4>
              <BaseBulletList :items="bulletItems" />
            </div>

            <div class="subsection">
              <h4 class="mini-heading">{{ t('design_system.ordered_list_title') }}</h4>
              <BaseOrderedList :items="orderedItems" />
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="ds-section">
        <BaseSectionHeader
            :icon="Layout"
            :title="t('design_system.section_spacing')"
        />

        <div class="two-columns two-columns--cards">
          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.spacing_grid_title') }}</h3>

            <ul class="spec-list">
              <li v-for="item in spacingItems" :key="item.label">
                <span class="bullet"></span>
                {{ item.label }}
                <code>{{ item.code }}</code>
              </li>
            </ul>
          </BaseCard>

          <BaseCard class="surface-card surface-card--panel" padding="none">
            <h3 class="section-kicker">{{ t('design_system.spacing_effects_title') }}</h3>

            <ul class="spec-list">
              <li v-for="item in effectItems" :key="item.label">
                <span class="bullet"></span>
                <template v-if="item.code">
                  {{ item.label }}
                  <code>{{ item.code }}</code>
                </template>
                <template v-else>
                  {{ item.label }}
                </template>
              </li>
            </ul>
          </BaseCard>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@reference "@/assets/main.css";

.design-system-page {
  padding: 0 1.5rem 8rem;
}

.design-system-page__container {
  max-width: var(--container-page);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-section);
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: var(--text-display);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--color-heading);
}

.page-description {
  max-width: 48rem;
  margin: 0;
  font-size: var(--text-body-lg);
  line-height: 1.7;
  color: var(--color-body);
}

.ds-section {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-stack,
.subsection,
.stack-md {
  display: flex;
  flex-direction: column;
}

.section-stack {
  gap: 2rem;
}

.subsection {
  gap: 1.25rem;
}

.stack-md {
  gap: 1rem;
}

:deep(.base-card) {
  --base-card-max-width: 100%;
  width: 100%;
  max-width: none;
}

:deep(.base-section-header__title) {
  font-size: var(--text-h2);
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.surface-card {
  width: 100%;

  &--swatch {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &--panel {
    padding: var(--space-card);
  }

  &--form {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  &--feature {
    padding: 2rem;
  }

  &--emphasis {
    position: relative;
    overflow: hidden;
    padding: 2rem;
    background: var(--color-heading);
    color: var(--color-white);
    box-shadow: var(--shadow-float);
  }

  &--placeholder {
    padding: 2rem;
    background: transparent;
    border: 2px dashed var(--color-border);
  }
}

.surface-card__content {
  position: relative;
  z-index: 1;
}

.surface-card__glow {
  position: absolute;
  right: -2.5rem;
  bottom: -2.5rem;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  background: rgba(72, 156, 134, 0.1);
  filter: blur(48px);
  transition: transform var(--duration-slow) var(--ease-standard);
}

.surface-card--emphasis:hover .surface-card__glow {
  transform: scale(1.5);
}

.card-grid {
  display: grid;
  gap: 1.25rem;
}

.card-grid--swatches {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.swatch {
  height: 7rem;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: flex-end;
  box-shadow: var(--shadow-inner);

  &--primary {
    background: var(--color-primary);
  }

  &--accent {
    background: var(--color-accent);
  }

  &--heading {
    background: var(--color-heading);
  }

  &--body {
    background: var(--color-body);
  }

  &--white {
    background: var(--color-white);
    border: 1px solid var(--color-border);
  }

  &--bg-cream {
    background: var(--color-bg-cream);
  }

  &--input-bg {
    background: var(--color-input-bg);
  }

  &--border {
    background: var(--color-border);
  }

  &--text-white {
    color: var(--color-white);
  }

  &--text-heading {
    color: var(--color-heading);
  }
}

.swatch__hex {
  font-size: 0.625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.swatch-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.swatch-content__title,
.card-title,
.table-card__title,
.popover-item__title {
  margin: 0;
  color: var(--color-heading);
  font-weight: 900;
}

.swatch-content__text,
.body-small {
  margin: 0;
  font-size: var(--text-body-sm);
  line-height: 1.6;
  color: var(--color-body);
}

.body-small--light {
  color: var(--color-white-soft-text);
}

.body-small--italic {
  font-style: italic;
}

.two-columns,
.three-columns {
  display: grid;
  gap: 2rem;
}

.two-columns {
  grid-template-columns: 1fr;
}

.two-columns--compact {
  gap: 1.5rem;
}

.three-columns {
  grid-template-columns: 1fr;
}

.type-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.type-sample {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.type-sample__display {
  font-size: 3.75rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--color-heading);
}

.type-sample__h1 {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.05em;
  color: var(--color-heading);
}

.type-sample__h2 {
  font-size: 2.25rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-heading);
}

.type-sample__h3 {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-heading);
}

.type-sample__body-lg {
  font-size: var(--text-body-lg);
  font-weight: 500;
  line-height: 1.7;
  color: var(--color-body);
}

.type-sample__body {
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-body);
}

.type-sample__body-sm {
  font-size: var(--text-body-sm);
  line-height: 1.5;
  color: rgba(90, 97, 106, 0.8);
}

.type-sample__overline {
  font-size: var(--text-overline);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(90, 97, 106, 0.7);
}

.type-meta {
  margin: 0;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-body-faint);
  letter-spacing: 0.08em;
}

.button-showcase {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.button-example {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.button-example :deep(.custom-btn) {
  width: 100%;
}

.micro-copy {
  margin: 0;
  font-size: 0.625rem;
  line-height: 1.5;
  color: var(--color-body-soft);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

:deep(.base-tag) {
  max-width: 7rem;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field__label {
  margin: 0;
  padding-left: 0.25rem;
  font-size: var(--text-overline);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-body);
}

.slider-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-body-faint);
}

.slider-meta__value {
  color: var(--color-primary);
}

.choice-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding-top: 0.5rem;
  align-items: flex-start;
}

.choice-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 12rem;
}

.choice-group--switch {
  justify-content: center;
}

.field__value {
  margin: 0;
  font-size: var(--text-caption);
  color: var(--color-body);

  span {
    color: var(--color-primary);
    font-weight: 900;
  }
}

.alert-stack {
  display: grid;
  gap: 1rem;
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &--soft {
    background: rgba(72, 156, 134, 0.1);
    color: var(--color-primary);
  }

  &--dark {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-primary);
  }

  &--neutral {
    background: var(--color-bg-cream);
    color: rgba(90, 97, 106, 0.3);
  }
}

.card-title {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.card-title--light {
  color: var(--color-white);
}

.table-main {
  font-size: var(--text-body-sm);
  font-weight: 900;
  color: var(--color-heading);
}

.table-sub {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-body-faint);
}

.icon-button {
  width: 2.25rem;
  height: 2.25rem;
  min-height: 2.25rem;
  padding: 0;
}

.usage-note {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-sm);
  background: var(--color-bg-cream);

  p {
    margin: 0;
    font-size: var(--text-caption);
    line-height: 1.6;
    color: var(--color-body);
  }

  span {
    color: var(--color-heading);
    font-weight: 900;
  }
}

.tooltip-demo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.popover-demo {
  display: inline-block;
}

.popover-trigger {
  position: relative;
}

.popover-trigger__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-accent);
}

.popover-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.popover-item {
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard);

  &:hover {
    background: var(--color-bg-cream);
  }
}

.popover-item__time {
  margin: 0.25rem 0 0;
  font-size: 0.625rem;
  color: var(--color-body-soft);
}

.mini-heading {
  margin: 0;
  font-size: var(--text-caption);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-heading);
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.spec-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: var(--text-body-sm);
  color: var(--color-body);
}

.bullet {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

.spec-list code {
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  background: var(--color-bg-cream);
  color: var(--color-primary);
  font-size: 0.75rem;
}

@media (min-width: 640px) {
  .card-grid--swatches {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .three-columns {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .card-grid--swatches {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>