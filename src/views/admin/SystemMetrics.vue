<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { getMetricsData } from '../../api/article.js';

// 数据初始化
const cpuUsage = ref(0);
const smoUsage = ref(0);
const threadCount = ref(0);
const maxThreadCount = ref(1000);
const isLoading = ref(true); // 加载状态
const timer = ref(null);

// 转换函数：从字节到 MB 和 GB
const bytesToMB = (bytes) => Math.round(bytes / (1024 * 1024));
const bytesToGB = (bytes) => Math.round(bytes / (1024 * 1024 * 1024));

// 图表配置
const cpuOption = ref({
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value', max: 50 },
  series: [{ type: 'line', data: [], smooth: true }]
});

const systemMemoryOption = ref({
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value', max: 100 },
  series: [{ type: 'line', data: [], smooth: true }]
});

const memoryOption = ref({
  tooltip: { trigger: 'item' },
  series: [{ type: 'pie', data: [] }]
});

const diskOption = ref({
  tooltip: { trigger: 'item' },
  series: [{ type: 'pie', data: [] }]
});

// 更新 CPU 数据
const updateCpuData = (cpu) => {
  const now = new Date().toLocaleTimeString();
  cpuOption.value.xAxis.data.push(now);
  cpuOption.value.series[0].data.push(cpu);
  if (cpuOption.value.xAxis.data.length > 10) {
    cpuOption.value.xAxis.data.shift();
    cpuOption.value.series[0].data.shift();
  }
};

// 更新系统内存数据
const updateSystemMemoryData = (memory) => {
  const now = new Date().toLocaleTimeString();
  systemMemoryOption.value.xAxis.data.push(now);
  systemMemoryOption.value.series[0].data.push(memory);
  if (systemMemoryOption.value.xAxis.data.length > 10) {
    systemMemoryOption.value.xAxis.data.shift();
    systemMemoryOption.value.series[0].data.shift();
  }
};

// 更新 JVM 内存数据
const updateJvmMemoryData = (jvmMemory) => {
  memoryOption.value.series[0].data = [
    { value: bytesToMB(jvmMemory.total), name: '当前分配的堆内存(MB)' },
    { value: bytesToMB(jvmMemory.free), name: '堆内存中的空闲内存(MB)' }
  ];
};

// 更新磁盘数据
const updateDiskData = (disk) => {
  diskOption.value.series[0].data = [
    { value: bytesToGB(disk.usedC), name: `C:已用空间: ${bytesToGB(disk.usedC)} GB` },
    { value: bytesToGB(disk.freeC), name: `C:剩余空间: ${bytesToGB(disk.freeC)} GB` },
    { value: bytesToGB(disk.usedD), name: `D:已用空间: ${bytesToGB(disk.usedD)} GB` },
    { value: bytesToGB(disk.freeD), name: `D:剩余空间: ${bytesToGB(disk.freeD)} GB` }
  ];
};

// 获取监控数据
const fetchMetrics = async () => {
  try {
    const res = await getMetricsData();
    const data = res.data;

    // 更新线程数
    threadCount.value = data.threadCount;

    // 更新 CPU
    cpuUsage.value = data.cpu;
    updateCpuData(data.cpu);

    // 更新系统内存
    smoUsage.value = data.systemMemory;
    updateSystemMemoryData(data.systemMemory);

    // 更新 JVM 内存
    updateJvmMemoryData(data.jvmMemory);

    // 更新磁盘
    updateDiskData(data.disk);
  } catch (error) {
    console.error('获取监控数据失败:', error);
  } finally {
    isLoading.value = false; // 隐藏加载动画
  }
};

onMounted(() => {
  use([CanvasRenderer, LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent]);
  fetchMetrics();
  timer.value = setInterval(fetchMetrics, 3000);
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});

// 计算属性，用于动态设置进度条的类名
const progressBarClass = computed(() => {
  const ratio = threadCount.value / maxThreadCount.value;
  if (ratio >= 0.8) return 'critical-load';
  if (ratio >= 0.5) return 'high-load';
  return '';
});
</script>

<template>
  <div>
    <el-card class="metrics-card">
      <span>系统监控面板</span>
      <hr/>
      <!-- 加载动画 -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>正在加载数据，请稍候...</p>
      </div>

      <div v-else>
        <!-- 线程使用情况 -->
        <div class="thread-progress-container">
          <label for="threadProgressBar">线程使用情况</label>
          <progress id="threadProgressBar" :value="threadCount" :max="maxThreadCount" :class="progressBarClass"></progress>
          <span>{{ threadCount }} / {{ maxThreadCount }}</span>
        </div>

        <!-- 第一行：CPU 使用率 和 JVM 内存 -->
        <div style="display: flex; gap: 20px;">
          <div class="chart-container" style="width: 48%;">
            <h3>CPU 使用率: {{ cpuUsage.toFixed(1) }}%</h3>
            <v-chart class="chart" :option="cpuOption" autoresize />
          </div>
          <div class="chart-container" style="width: 48%;">
            <h3>JVM 内存（堆内存）</h3>
            <v-chart class="chart" :option="memoryOption" autoresize />
          </div>
        </div>

        <!-- 第二行：系统内存 和 磁盘使用 -->
        <div style="display: flex; gap: 20px;">
          <div class="chart-container" style="width: 48%;">
            <h3>系统内存 使用率: {{ smoUsage.toFixed(1) }}%</h3>
            <v-chart class="chart" :option="systemMemoryOption" autoresize />
          </div>
          <div class="chart-container" style="width: 48%;">
            <h3>磁盘使用</h3>
            <v-chart class="chart" :option="diskOption" autoresize />
          </div>
        </div>
      </div>


    </el-card>
  </div>
</template>

<style scoped>
.chart-container {
  margin: 20px 0;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.thread-progress-container {
  margin: 20px 0;
  font-family: Arial, sans-serif;
}

.thread-progress-container label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.thread-progress-container progress {
  width: 100%;
  height: 20px;
  border-radius: 5px;
  background-color: #f3f3f3;
  box-shadow: inset 0px 1px 3px rgba(0, 0, 0, 0.1);
}

.thread-progress-container progress::-webkit-progress-bar {
  background-color: #f3f3f3;
  border-radius: 5px;
}

.thread-progress-container progress::-webkit-progress-value {
  background-color: #4caf50; /* 绿色 - 正常状态 */
  border-radius: 5px;
}

.thread-progress-container progress::-moz-progress-bar {
  background-color: #4caf50; /* 对应Firefox */
  border-radius: 5px;
}

.thread-progress-container progress.high-load::-webkit-progress-value {
  background-color: #ff9800; /* 橙色 - 警告 */
}

.thread-progress-container progress.critical-load::-webkit-progress-value {
  background-color: #f44336; /* 红色 - 危险 */
}

.thread-progress-container span {
  display: block;
  margin-top: 5px;
  text-align: center;
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>