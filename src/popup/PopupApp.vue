<template>
  <a-card style="width: 100%" title="临时模式">
    <div class="toggle-row">
      <a-switch
        v-model:checked="state.isTemporarilyDisabled"
        checked-children="已开启"
        un-checked-children="已关闭"
      />
      <span class="toggle-label">暂停拦截</span>
    </div>

    <div class="hint">
      仅在临时需要访问时开启，记得及时关闭。
    </div>

    <a-divider />

    <a-button type="primary" block @click="openOptions">
      更多设置
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
