<template>
  <a-card style="width: 100%" :title="$t('popup_title')">
    <div class="toggle-row">
      <a-switch
        v-model:checked="state.isTemporarilyDisabled"
        :checked-children="$t('popup_enabled')"
        :un-checked-children="$t('popup_disabled')"
      />
      <span class="toggle-label">{{ $t('popup_pause') }}</span>
    </div>

    <div class="hint">
      {{ $t('popup_hint') }}
    </div>

    <a-divider />

    <a-button type="primary" block @click="openOptions">
      {{ $t('popup_more') }}
    </a-button>
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { getConfig, saveConfig } from '../utils/storage';

const state = reactive({
  isTemporarilyDisabled: false,
});

const isReady = ref(false);

onMounted(async () => {
  const config = await getConfig();
  state.isTemporarilyDisabled = !!config.isTemporarilyDisabled;
  isReady.value = true;
});

watch(
  () => state.isTemporarilyDisabled,
  async (val) => {
    if (!isReady.value) return;
    const current = await getConfig();
    await saveConfig({ ...current, isTemporarilyDisabled: val });
  },
);

const openOptions = () => {
  if (chrome?.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
    return;
  }
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
};
</script>

<style scoped>
.toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-label {
  font-size: 14px;
  color: #333;
}

.hint {
  margin-top: 10px;
  font-size: 12px;
  color: #888;
}
</style>
