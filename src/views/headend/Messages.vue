<script setup>
import { ref, reactive, computed } from 'vue'

// 导航标签数据
const tabs = [
  '我的消息',
  '评论我的',
  '新增粉丝',
  '点赞与收藏',
]
const activeTab = ref('我的消息')

// 模拟不同标签页的数据
const tabData = {
  '我的消息': [
    {
      id: 1,
      avatar: 'one-piece-114.png',
      username: '盼小辉',
      followed: true,
      time: '11:30',
      preview: '大家好，很感谢大家的关注。想...',
      official: false,
      group: 'recent'
    },
    {
      id: 2,
      avatar: 'csdn.png',
      username: 'CSDN系统',
      followed: false,
      time: '04-11',
      preview: '启蒙游戏页',
      official: true,
      group: 'recent'
    }
  ],
  '评论和@': [
    {
      id: 3,
      avatar: 'code-jia.png',
      username: 'Codet.Jia',
      followed: true,
      time: '03-29',
      preview: 'hi，我刚给你了一篇建议：<Q1>。',
      official: false,
      group: 'two-weeks-ago'
    }
  ],
  '已购上新': [],
  '新增粉丝': [],
  '赞和收藏': [],
  '有奖任务': []
}

// 当前标签页的消息数据
const currentMessages = ref(tabData[activeTab.value])

// 切换标签页时更新数据
const switchTab = (tab) => {
  activeTab.value = tab
  currentMessages.value = tabData[tab] // 更新当前标签页的数据
  console.log('value ' , activeTab.value)
}

// 控制聊天界面的状态
const isChatOpen = ref(false)
const currentChatUser = ref(null)

// 打开聊天界面
const openChat = (user) => {
  currentChatUser.value = user
  isChatOpen.value = true
}

// 关闭聊天界面
const closeChat = () => {
  isChatOpen.value = false
  currentChatUser.value = null
}
</script>

<template>
  <div class="message-container">
    <!-- 导航标签 -->
    <div class="nav-tabs">
      <div
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-item', { 'active': activeTab === tab }]"
          @click="switchTab(tab)"
      >
        {{ tab }}
      </div>
    </div>

    <div v-if="activeTab === tabs[0] " class="content-wrapper">
      <!-- 左侧面板：用户列表 -->
      <div class="left-panel">
        <div class="user-list">
          <div
              v-for="message in currentMessages"
              :key="message.id"
              class="user-item"
              @click="openChat(message)"
          >
            <div class="avatar-box">
              <img :src="message.avatar" class="avatar" />
              <span v-if="message.official" class="official-tag">官方</span>
            </div>

            <div class="content-box">
              <div class="header">
                <span class="username">{{ message.username }}</span>
                <span v-if="message.followed" class="follow-status">已关注</span>
                <span class="time">{{ message.time }}</span>
              </div>
              <div class="preview">{{ message.preview }}</div>
            </div>
          </div>
        </div>

        <!-- 底部提示 -->
        <div v-if="!isChatOpen && activeTab === '我的消息'" class="empty-tip">
          您还未选中或者发起聊天，快去跟好友聊一聊吧
        </div>
      </div>

      <!-- 右侧聊天框 -->
      <div class="right-panel" v-if="isChatOpen">
        <div class="chat-header">
          <div class="back-button" @click="closeChat">返回</div>
          <div class="chat-title">{{ currentChatUser.username }}</div>
        </div>
        <div class="chat-body">
          <p>这里是与 {{ currentChatUser.username }} 的聊天内容。</p>
        </div>
      </div>
    </div>















  </div>
</template>



<style scoped>
.message-container {
  max-width: 70%; /* 占页面的 70% */
  margin: 40px auto; /* 添加顶部间距 */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 样式部分 */
.content-wrapper {
  display: flex; /* 使用 Flexbox 布局 */
  height: calc(100vh - 250px); /* 动态高度 */
}

.left-panel {
  width: 30%; /* 占页面宽度的 30% */
  border-right: 1px solid #eee;
  overflow-y: auto; /* 允许滚动 */
  padding: 16px;
}

.right-panel {
  width: 70%; /* 占页面宽度的 70% */
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.user-item:hover {
  background-color: #f8f8f8;
}


.nav-tabs {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px;
  color: #666;
  cursor: pointer;
}

.tab-item.active {
  color: #007bff;
  font-weight: 500;
  border-bottom: 2px solid #007bff;
}

.avatar-box {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.official-tag {
  position: absolute;
  right: -4px;
  bottom: 0;
  background: #ff4444;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
}

.content-box {
  flex: 1;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 500;
  margin-right: 8px;
}

.follow-status {
  color: #666;
  font-size: 12px;
  margin-right: auto;
}

.time {
  color: #999;
  font-size: 12px;
}

.preview {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}


.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

.chat-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.back-button {
  color: #007bff;
  cursor: pointer;
  margin-right: 16px;
}

.chat-title {
  font-size: 18px;
  font-weight: 500;
}

.chat-body {
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
}



</style>