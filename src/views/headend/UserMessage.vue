<script lang="ts" setup>
import {onMounted, ref , onUnmounted , computed } from "vue";
import { Search } from '@element-plus/icons-vue'
import {findWaitingOrNoPassService} from "../../api/article"
import {userInfoStore} from '../../stores/userInfo'
import router from '../../router/indexs'
import {ComponentSize} from "element-plus";


const infoStore = userInfoStore();

const article = ref([
  {
    id: 1,
    coverImg: '12',
    createUser: 'bailongfei',
    categoryId:2,
    title: 'bailongfei',
    createTime: '2020-12-1',
    updateTime: '2020-12-1',
    content: ' hello world',
    state: '已发布'
  }
]);

const article2 = ref([
  {
    id: 1,
    coverImg: '12',
    createUser: 'bailongfei',
    categoryId:2,
    title: 'bailongfei',
    createTime: '2020-12-1',
    updateTime: '2020-12-1',
    content: ' hello world',
    state: '已发布',
    deleted: ''
  }
]);

const messageNum = ref(0)
const flag = ref(false)
const waiting = 1
const noPass = 3
const findAuditWaiting = async () => {
  const result = await findWaitingOrNoPassService(waiting);
  article.value = result.data
  if (article.value == ''){
    flag.value = true;
  }
  const result2 = await findWaitingOrNoPassService(noPass);
  article2.value = result2.data
  const maxLength = 70;
  const maxTitleLength = 20;
  for (let i = 0; i < article.value.length; i++) {
    let passage = article.value[i].content;
    let title = article.value[i].title;
    if (passage.length > maxLength){
      article.value[i].content = passage.substring(0,maxLength) +  ' . . .' ;
    }
    if (title.length >= maxTitleLength){
      article.value[i].title = title.substring(0,maxTitleLength) +  ' . . .' ;
    }
  }

  //---------------------------------------------------------------------------------
  for (let i = 0; i < article2.value.length; i++) {
    let passage = article2.value[i].content;
    let title = article2.value[i].title;
    if (passage.length > maxLength){
      article2.value[i].content = passage.substring(0,maxLength) +  ' . . .' ;
    }
    if (title.length >= maxTitleLength){
      article2.value[i].title = title.substring(0,maxTitleLength) +  ' . . .' ;
    }
    if (article2.value[i].deleted == 3){
      messageNum.value = messageNum.value + 1;
    }
  }

  infoStore.setMessageNum(messageNum.value)
}
findAuditWaiting()

// ########################################

const message = ref({})
const tableData = ref([])
// 定义响应式数据
const status = ref();
const search = ref('')
const currentPage4 = ref(1)
const pageSize4 = ref(8)
const total = ref(120)
const background = ref(false)
const disabled = ref(false)
const warningFlag = ref(false)
const messageContent = ref(''); // 响应式变量用于存储WebSocket消息内容
const detailsDialog = ref(false)
const handleSizeChange = (size) => {
  pageSize4.value = size;
  showMsgList();
}
const handleCurrentChange = (num) => {
  currentPage4.value = num;
  showMsgList();
}

import {initWebSocket , setOnMessageHandler , send , disconnect} from '../../utils/webSocketAdmin'
import {receiveMsg , showMsgListService , deleteMsgByIdsService} from '../../api/message'
import {log} from "echarts/types/src/util/log";
let socket = ref(null);
const userId = ref(null)
userId.value = infoStore.info.username


onMounted( () => {
  socket.value = initWebSocket(userId.value);
  receiveMsg(userId.value);
  setOnMessageHandler((event) => {
    // 检查 event.data 是否为空
    if (!event.data || event.data.trim() === '') {
      console.log('Received message is empty.');
      warningFlag.value = false; // 不显示对话框
    } else {
      console.log('New message received:', event.data);
      // 更新消息内容并显示对话框
      messageContent.value = event.data;
      warningFlag.value = true; // 显示对话框
    }
  });
})

// 组件卸载时断开WebSocket连接
onUnmounted(() => {
  if (socket) {
    disconnect(socket.value)// 关闭WebSocket连接
  }
});

//关闭对话框
const submitMessage = () => {
  // 处理提交逻辑...
  warningFlag.value = false;
  disconnect(socket.value)
};

const showMsgList = async () => {
  let params = {
    pageNum: currentPage4.value,
    pageSize: pageSize4.value,
    isRead: status.value ? status.value : null,
    title: search.value
  }
  const result = await showMsgListService(params);
  total.value = result.data.total
  tableData.value = result.data.items
}
showMsgList();

const fuzzySearch = () => {
  showMsgList();
}

const handleClick = async (row) => {
  detailsDialog.value = true
  message.value.articleTitle = row.articleTitle
  message.value.author = row.sendId
  message.value.time = row.createTime
  message.value.content = row.content
  //设为已读
  const rowIdArray = computed(() => normalizeIds(row.id));
  const selectedIds = ref()
  console.log(rowIdArray.value)
  // 创建 selectedIds.value 的副本以避免直接修改原始数据
  let updatedIds = [...rowIdArray.value];
  // 使用 unshift 方法将 '1' 添加到数组的开头
  updatedIds.unshift(1);
  selectedIds.value = updatedIds;
  if (selectedIds.value.length > 0) {
    await deleteMsgByIdsService(selectedIds.value);
  }
}

//批量删除 | 删除  | 设为已读
const selectedIds = ref()
const handleSelectionChange =  (val) => {
  // val 参数包含当前选中的所有行数据
  selectedIds.value = val.map(item => item.id);
  //console.log("zhe " + selectedIds.value)
}

//定义一个函数来规范化ids为数组
const normalizeIds = (ids) => {
  if (Array.isArray(ids)) {
    return ids;
  } else if (typeof ids === 'number') {
    return [ids];
  }
  return [];
};

const deleteMsgByIds = async (row) => {
  //设为已读
  if (row === 'markRead'){
    // 创建 selectedIds.value 的副本以避免直接修改原始数据
    let updatedIds = [...selectedIds.value];
    // 使用 unshift 方法将 '1' 添加到数组的开头
    updatedIds.unshift(1);
    // 更新 selectedIds.value 或者你需要更新的地方
    selectedIds.value = updatedIds;
    // 更新为已读
    await deleteMsgByIdsService(selectedIds.value)
    //console.log('Updated IDs:', selectedIds.value);
  }

  //批量删除
  if (selectedIds.value != '' && selectedIds.value != null) {
    await deleteMsgByIdsService(selectedIds.value)
  }
  //单个删除
  const rowIdArray = computed(() => normalizeIds(row.id));
  if (rowIdArray.value.length > 0) {
    await deleteMsgByIdsService(rowIdArray.value);
  }
  await showMsgList();
}

const exitDetailsDialog = async () => {
  detailsDialog.value = false;
  await showMsgList();
}




</script>

<template>
  <div>
    <el-dialog v-model="warningFlag" title="警告" width="30%" style="border-radius: 10px">
      <p>{{ messageContent }}</p> <!-- 绑定消息内容 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitMessage">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

  <!-- 详情对话框 -->
  <div>
    <el-dialog
        top="5vh"
        v-model="detailsDialog"

        class="detail-dialog"
        draggable
        :style="{ height: '740px', width: '940px' , borderRadius: '10px' }"
    >
      <div style="text-align: center;">
        <!-- 标题居中显示，使用较大的字体 -->
        <h1 style="font-size: 2em; margin-bottom: 10px;">{{ message.articleTitle }}</h1>

        <!-- 作者和时间信息在同一行显示，字体较小 -->
        <p style="font-size: 0.875em; color: #666;">
          发布人：{{ message.author }}
          <span style="margin: 0 10px;">|</span>
          发布时间：{{ message.time }}
        </p>
      </div>
      <hr/>
      <!-- 正文内容优雅展示 -->
      <div style="padding: 20px; line-height: 1.75; font-size: 1.2em; color: #333;">
        {{ message.content }}
      </div>

      <template #footer></template>
        <div class="detail-footer">
          <el-button type="primary" @click="exitDetailsDialog">
            关闭
          </el-button>
        </div>

    </el-dialog>
  </div>

  <div class="fullscreen-bg">
    <el-card class="card_01">
      <div class="select_01">
        <span>消息状态:</span>
        <el-select size="default" v-model="status" placeholder="请选择状态">
          <el-option label="未读" value="0"></el-option>
          <el-option label="已读" value="1"></el-option>
          <el-option label="全部" ></el-option>
        </el-select>
      </div>
      <div class="mb-4" style="margin-bottom: 20px">
        <el-button  type="primary" plain @click="deleteMsgByIds('markRead')">设为已读</el-button>
        <el-button type="danger" plain @click="deleteMsgByIds">批量删除</el-button>
        <div class="input-wrapper">
          <input
              type="text"
              v-model="search"
              class="elliptical-input"
              placeholder="搜索"
          />
          <i class="el-icon-search suffix-icon"><el-button :icon="Search" circle @click="fuzzySearch" /></i>
        </div>

      </div>
      <div>
        <el-scrollbar max-height="600px">
        <el-table :data="tableData" style="width: 80%;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="100" />
          <el-table-column fixed prop="articleTitle" label="标题" width="350" >
            <template #default="scope">
              <el-badge v-if="scope.row.isRead !== 1" is-dot class="title_item">
                <span>{{ scope.row.articleTitle }}</span>
              </el-badge>
              <!-- 当 shouldShowBadge 返回 false 时，直接显示标题文本 -->
              <span v-else>{{ scope.row.articleTitle }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" width="300" />
          <el-table-column prop="createTime" label="发布时间" width="200" />
          <el-table-column prop="isRead" label="状态" width="150" >
            <template #default="scope">
                <span :class="{ read: scope.row.isRead === 1, unread: scope.row.isRead === 0 }">
                  {{ scope.row.isRead === 1 ? '已读' : '未读' }}
                </span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" min-width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="default" @click="handleClick(row)">
                详情
              </el-button>
              <el-button link type="danger" size="default" @click="deleteMsgByIds(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        </el-scrollbar>
      </div>

      <div class="demo-pagination-block">
        <el-pagination
            v-model:current-page="currentPage4"
            v-model:page-size="pageSize4"
            :page-sizes="[10, 20, 30, 40]"
            :small="true"
            :disabled="disabled"
            :background="background"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>


    </el-card>


  </div>
</template>

<style scoped>
.detail-dialog {
  position: relative; /* 确保内部绝对定位元素相对于对话框定位 */
}
/* 固定按钮位置到对话框的最右下角 */
.detail-footer {
  position: absolute;
  bottom: 20px; /* 距离底部的距离 */
  right: 20px; /* 距离右边的距离 */
}

.read {
  color: #32CD32;;
}
.unread {
  color: black;
}
.title_item {
  margin-top: 10px;
  margin-right: 40px;
}

.elliptical-input {
  border-radius: 50px; /* 设置较大的半径值来创建椭圆形状 */
  width: 250px; /* 保持宽度 */
  height: 40px; /* 设置固定高度 */
  padding: 0 10px; /* 内边距，以确保输入内容有空间 */
  font-size: 16px; /* 字体大小 */
  border: 1px solid #dcdfe6; /* 边框颜色 */
  outline: none; /* 去除默认的聚焦边框 */
  box-sizing: border-box; /* 确保 padding 和 border 不会增加元素的总宽度 */
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1); /* 平滑过渡效果 */
}
.input-wrapper {
  position: relative;
  display: inline-block;
  margin-left: 800px;
}
.input-wrapper .suffix-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.suffix-icon button {
  pointer-events: auto; /* 确保按钮可以接收鼠标事件 */
}
.elliptical-input:focus {
  border-color: #409eff; /* 聚焦时的边框颜色 */
}
.select_01 {
  width: 300px;
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 间距 */
  margin-bottom: 20px;
}
.select_01 span {
  white-space: nowrap; /* 防止文字换行 */
}
.fullscreen-bg {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 93vh; /* 全屏高度 */
  background-color: #dcecfc; /* 设置背景颜色 */
}

.card_01 {
  width: 95%; /* 占据整个屏幕宽度 */
  height: 95%; /* 占据整个屏幕高度 */
}

.demo-pagination-block {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中（可选） */
  margin-top: 30px;
}



</style>