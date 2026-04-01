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

    <div v-if="state.isTemporarilyDisabled" class="countdown">
      {{ $t('popup_remaining') }}： {{ remainingText }}
    </div>

    <a-divider />

    <a-button type="primary" block @click="openOptions">
      {{ $t('popup_more') }}
    </a-button>
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { getConfig, saveConfig } from '../utils/storage';

const TEMP_DISABLE_MS = 10 * 60 * 1000;

const state = reactive({
  isTemporarilyDisabled: false,
  temporarilyDisabledUntil: undefined as number | undefined,
});

const remainingMs = ref(0);
const isReady = ref(false);
let timerId: number | undefined;

const remainingText = computed(() => {
  const diff = Math.max(0, remainingMs.value);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const startCountdown = () => {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(async () => {
    if (state.isTemporarilyDisabled && state.temporarilyDisabledUntil) {
      const diff = state.temporarilyDisabledUntil - Date.now();
      remainingMs.value = Math.max(0, diff);

      // 倒计时结束后自动关闭临时放行
      if (diff <= 0) {
        state.isTemporarilyDisabled = false;
        state.temporarilyDisabledUntil = undefined;
        const current = await getConfig();
        await saveConfig({
          ...current,
          isTemporarilyDisabled: false,
          temporarilyDisabledUntil: undefined,
        });
      }
    } else {
      remainingMs.value = 0;
    }
  }, 1000);
};

onMounted(async () => {
  const config = await getConfig();
  state.isTemporarilyDisabled = !!config.isTemporarilyDisabled;
  state.temporarilyDisabledUntil = config.temporarilyDisabledUntil;
  if (state.temporarilyDisabledUntil) {
    // 初始化剩余时间，避免第一次渲染闪烁
    remainingMs.value = Math.max(0, state.temporarilyDisabledUntil - Date.now());
  }

  // 仅展示倒计时，不在打开弹窗时重置计时
  isReady.value = true;
  startCountdown();
});

onUnmounted(() => {
  if (timerId) window.clearInterval(timerId);
});

watch(
  () => state.isTemporarilyDisabled,
  async (val) => {
    if (!isReady.value) return;
    const current = await getConfig();

    if (val) {
      // 用户手动开启时才设置新的 10 分钟有效期（已有有效时间则不重置）
      if (current.temporarilyDisabledUntil && current.temporarilyDisabledUntil > Date.now()) {
        state.temporarilyDisabledUntil = current.temporarilyDisabledUntil;
        return;
      }

      const until = Date.now() + TEMP_DISABLE_MS;
      state.temporarilyDisabledUntil = until;
      await saveConfig({
        ...current,
        isTemporarilyDisabled: true,
        temporarilyDisabledUntil: until,
      });
    } else {
      state.temporarilyDisabledUntil = undefined;
      await saveConfig({
        ...current,
        isTemporarilyDisabled: false,
        temporarilyDisabledUntil: undefined,
      });
    }
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

.countdown {
  margin-top: 6px;
  font-size: 12px;
  color: #4a4a4a;
}
</style>
