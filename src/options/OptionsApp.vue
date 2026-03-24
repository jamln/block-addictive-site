<template>
  <a-card class="page-card" title="配置中心">
    <a-switch
      v-model:checked="state.isTemporarilyDisabled"
      checked-children="已开启"
      un-checked-children="已关闭"
    />
    <div class="section-hint">临时放行模式</div>

    <a-divider />

    <div class="section-title">黑名单域名</div>
    <a-input-search
      v-model:value="newDomain"
      placeholder="添加域名，例如 facebook.com"
      enter-button="添加"
      @search="addDomain"
    />

    <a-list
      class="domain-list"
      :data-source="state.blockedDomains"
      :locale="{ emptyText: '暂无域名' }"
    >
      <template #renderItem="{ item, index }">
        <a-list-item>
          {{ item }}
          <template #actions>
            <a-button type="link" size="small" @click="removeDomain(index)">
              删除
            </a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <a-divider />

    <div class="section-title">时间规则</div>
    <a-checkbox-group v-model:value="state.activeDays" class="days-group" :options="days">
      <div class="days-wrap">
        <a-checkbox
          v-for="(day, index) in days"
          :key="index"
          :value="day.value"
          class="day-item"
        >
          {{ day.label }}
        </a-checkbox>
      </div>
    </a-checkbox-group>

    <div
      v-for="(timeRange, index) in state.timeRanges"
      :key="index"
      class="time-row"
    >
      <a-time-picker v-model:value="timeRange.start" format="HH:mm" class="time-picker" />
      <a-time-picker v-model:value="timeRange.end" format="HH:mm" class="time-picker" />
      <a-button type="link" size="small" @click="removeTimeRange(index)">
        删除
      </a-button>
    </div>

    <a-button type="link" size="small" @click="addTimeRange">
      添加时间段
    </a-button>
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { getConfig, saveConfig, type BlockConfig } from '../utils/storage';

const state = reactive({
  isTemporarilyDisabled: false,
  blockedDomains: [] as string[],
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  timeRanges: [
    { start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') },
  ],
});

const newDomain = ref('');
const isReady = ref(false);
let saveTimer: number | undefined;

const days = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 },
];

onMounted(async () => {
  const config = await getConfig();

  state.isTemporarilyDisabled = !!config.isTemporarilyDisabled;
  state.blockedDomains = config.blockedDomains || [];
  state.activeDays = (config.activeDays && config.activeDays.length)
    ? config.activeDays
    : [0, 1, 2, 3, 4, 5, 6];

  const ranges = config?.timeRanges?.length
    ? config.timeRanges
    : [{ start: '00:00', end: '23:59' }];

  state.timeRanges = ranges.map((timeRange) => ({
    start: dayjs(timeRange.start, 'HH:mm'),
    end: dayjs(timeRange.end, 'HH:mm'),
  }));

  isReady.value = true;
});

watch(
  state,
  (newState) => {
    if (!isReady.value) return;
    if (saveTimer) window.clearTimeout(saveTimer);

    saveTimer = window.setTimeout(async () => {
      const rawData: BlockConfig = JSON.parse(JSON.stringify(newState));
      rawData.timeRanges = rawData.timeRanges.map((timeRange) => ({
        start: dayjs(timeRange.start).format('HH:mm'),
        end: dayjs(timeRange.end).format('HH:mm'),
      }));
      await saveConfig(rawData);
    }, 300);
  },
  { deep: true },
);

const normalizeDomain = (domain: string) => domain.trim().toLowerCase();

const addDomain = () => {
  const domain = normalizeDomain(newDomain.value);
  if (!domain) return;
  if (state.blockedDomains.includes(domain)) return;
  state.blockedDomains.push(domain);
  newDomain.value = '';
};

const removeDomain = (index: number) => {
  state.blockedDomains.splice(index, 1);
};

const addTimeRange = () => {
  state.timeRanges.push({
    start: dayjs('00:00', 'HH:mm'),
    end: dayjs('23:59', 'HH:mm'),
  });
  state.timeRanges = [...state.timeRanges];
};

const removeTimeRange = (index: number) => {
  state.timeRanges.splice(index, 1);
  state.timeRanges = [...state.timeRanges];
};
</script>

<style scoped>
.page-card {
  width: 100%;
}

.section-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.section-hint {
  margin-top: 10px;
  color: #666;
  font-size: 12px;
}

.domain-list {
  margin-top: 10px;
}

.days-group {
  width: 100%;
}

.days-wrap {
  display: flex;
  flex-wrap: wrap;
}

.day-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.time-picker {
  width: 45%;
}
</style>
