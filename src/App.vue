<template>
  <a-card
    style="width: 100%; overflow-y: auto"
    title="配置中心"
  >
    <a-switch
      v-model="state.isTemporarilyDisabled"
      checked-children="开启"
      un-checked-children="关闭"
    />
    <div style="margin-top: 10px">临时放行模式</div>

    <a-divider />

    <div style="margin-bottom: 10px">黑名单域名</div>
    <a-input-search
      v-model:value="newDomain"
      placeholder="添加域名"
      enter-button="添加"
      @search="addDomain"
    />

    <a-list
      style="margin-top: 10px"
      :data-source="state.blockedDomains"
      :locale="{ emptyText: '空' }"
    >
      <template #renderItem="{ item, index }">
        <a-list-item>
          {{ item }}
          <template #actions>
            <a-button
              type="link"
              size="small"
              @click="removeDomain(index)"
              >删除</a-button
            >
          </template>
        </a-list-item>
      </template>
    </a-list>

    <a-divider />

    <div style="margin-bottom: 10px">时间规则</div>
    <a-checkbox-group
      v-model:value="state.activeDays"
      style="width: 100%"
      :options="days"
    >
      <div style="display: flex; flex-wrap: wrap">
        <a-checkbox
          v-for="(day, index) in days"
          :key="index"
          :value="day.value"
          style="margin-right: 10px; margin-bottom: 10px"
        >
          {{ day.label }}
        </a-checkbox>
      </div>
    </a-checkbox-group>

    <div
      style="display: flex; justify-content: space-between; margin-top: 10px"
    >
      <a-time-picker
        v-model="state.timeRange.start"
        format="HH:mm"
        style="width: 45%"
      />
      <a-time-picker
        v-model="state.timeRange.end"
        format="HH:mm"
        style="width: 45%"
      />
    </div>

    <!-- <a-button
      type="primary"
      style="width: 100%; margin-top: 20px"
      @click="saveConfig"
      >保存</a-button
    > -->
  </a-card>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { getConfig, saveConfig } from './utils/storage';

// 1. 严格初始化的响应式状态
const state = reactive({
  isTemporarilyDisabled: false,
  blockedDomains: [],
  activeDays: [0, 1, 2, 3, 4, 5, 6], // 默认全选
  timeRange: { start: '00:00', end: '23:59' },
});

const newDomain = ref('');
const isReady = ref(false); // 防止初始化时的覆盖保存
const days = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 },
];

// 2. 挂载时读取数据
onMounted(async () => {
  const config = await getConfig();
  // 必须深层合并，防止丢失 Proxy 响应式
  state.isTemporarilyDisabled = config.isTemporarilyDisabled || false;
  state.blockedDomains = config.blockedDomains || [];
  state.activeDays = config.activeDays || [];
  state.timeRange = config.timeRange || { start: '00:00', end: '23:59' };

  console.log('🟢 [Popup] 初始化读取配置成功:', config);

  // 延迟开启 watch，防止初始化赋值触发自动保存
  setTimeout(() => {
    isReady.value = true;
  }, 100);
});

// 3. 稳健的添加/删除逻辑
const addDomain = () => {
  console.log("🚀 ~ addDomain ~ domain:", newDomain);
  const domain = newDomain.value.trim().toLowerCase(); // 统一转小写防误判
  if (domain && !state.blockedDomains.includes(domain)) {
    state.blockedDomains.push(domain); // 触发响应式
    newDomain.value = ''; // 清空输入框
  }
};

const removeDomain = (index) => {
  state.blockedDomains.splice(index, 1);
};

// 4. 深度监听并保存
watch(
  state,
  async (newState) => {
    // if (!isReady.value) return; // 初始化还没完成时不保存

    try {
      // 彻底剥离 Proxy 外壳，转换为纯净的 JS 对象
      const rawData = JSON.parse(JSON.stringify(newState));
      await saveConfig(rawData);
      console.log('💾 [Popup] 数据已自动保存:', rawData);
    } catch (error) {
      console.error('❌ [Popup] 保存失败:', error);
    }
  },
  { deep: true },
);
</script>
