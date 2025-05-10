<script setup>
import {onMounted, ref} from "vue";
import {attentionService, existsFollowService, findUserAttention, unAttentionService} from "../../../api/user.js"
import {userInfoStore} from "../../../stores/userInfo.js"
import { useRouter  } from 'vue-router';
import avatar from '@/assets/default.png'

const router = useRouter();
const infoStore = userInfoStore();
// 示例数据结构
const followingUsers = ref([])
followingUsers.value = followingUsers.value.map(user => ({
  ...user,
  isAttention: false // 初始化关注状态
}));

onMounted(async () => {
  await findAttention();
  await existsFollowing();
})

const existsFollowing = async () => {
  for (const user of followingUsers.value){
    let params = {followerId: infoStore.info.id, followingId: user.id}
    const isExists = await existsFollowService(params);
    if (isExists.code === 0 && isExists.data !== 'null') {
      user.isAttention = true
    }
  }
}

const toggleFollow = async (user) => {
  let params = {
    followerId: infoStore.info.id,
    followingId: user.id
  }
  if (user.isAttention){
    const result = await unAttentionService(params);
    if (result.code === 0){
      user.isAttention = !user.isAttention;
    }
  }else {
    const result = await attentionService(params);
    if (result.code === 0){
      user.isAttention = !user.isAttention;
    }
  }

}

const findAttention = async () => {
  const result = await findUserAttention(infoStore.info.id);
  followingUsers.value = result.data;
}

const navigateToAuthorPage = (username , id) => {
  const resolved = router.resolve({
    path: '/article/peopleCentral',
    query: {p: username , id: id}
  });
  // 使用window.open在新标签页中打开链接
  window.open(resolved.href, '_blank');
};

</script>

<template>
  <div>
    <ul class="user-list">
      <!-- 循环开始 -->
      <li v-for="user in followingUsers" :key="user.id" class="user-item">
        <div class="user-avatar">
          <img :src="user.userPic ? user.userPic : avatar" alt="头像" class="avatar-img">
        </div>
        <div class="user-info">
          <div class="user-main">
            <h3 class="user-nickname" @click="navigateToAuthorPage(user.username , user.id)">{{ user.username }}</h3>
            <p class="user-email">{{ user.email ? user.email : '无' }}</p>
          </div>
          <div class="user-meta">
            <span class="create-time">加入于 {{ user.createTime }}</span>
          </div>
        </div>
<!--        <button class="follow-btn">已关注</button>-->
        <button
            :class="['follow-btn', { 'active': user.isAttention }]"
            @click="toggleFollow(user)"
        >
          {{ user.isAttention ? '已关注' : '+ 关注' }}
        </button>
      </li>
      <!-- 循环结束 -->
    </ul>
  </div>

</template>

<style scoped>
.user-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  max-width: 800px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.user-item:hover {
  transform: translateY(-2px);
}

.user-avatar {
  position: relative;
  margin-right: 16px;
}

.avatar-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-default {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-main {
  margin-bottom: 6px;
}

.user-nickname {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  cursor: pointer; /* 鼠标变为手型 */
  transition: all 0.3s ease; /* 添加平滑过渡效果 */
}
.user-nickname:hover {
  color: #007bff; /* 悬停时改变颜色 */
  text-decoration: underline; /* 添加下划线 */
}

.user-email {
  margin: 0;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-meta {
  font-size: 12px;
  color: #999;
}

.follow-btn {
  padding: 8px 20px;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  background: #e0e0e0;
}
</style>