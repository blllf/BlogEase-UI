<script setup>
import { ref, onMounted } from 'vue';
import {hotEssayListService} from '../../../api/article.js'
import {findRankService} from '../../../api/user.js'
import avatar from '@/assets/default.png';
import {truncateTitle} from '../../../api/genericFunctions.js'
import {useRoute, useRouter} from "vue-router";
const route = useRoute();// 获取当前路由对象
const router = useRouter();
const activeTab = ref('articles'); // 当前激活的排行榜类型
const articles = ref([]); // 文章数据
const users = ref([]);    // 用户数据
const number = ref(8)
// 模拟数据加载
onMounted(async () => {
  await hotEssayListData();
  await popularityListData();
});
//热文榜
const hotEssayListData = async () => {
  const result = await hotEssayListService(number.value);
  articles.value = result.data
}
//人气榜
const popularityListData = async () => {
  const result = await findRankService();
  users.value = result.data.slice(0,8)
}

// 排名图标样式
const rankIcons = ['🥇', '🥈', '🥉'];

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
  <div class="rank-container">
    <!-- 模式切换 -->
    <div class="tab-switch">
      <button
          :class="{ active: activeTab === 'articles' }"
          @click="activeTab = 'articles'"
      >
        热文榜
      </button>
      <button
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
      >
        人气榜
      </button>
    </div>

    <!-- 文章排行榜 -->
    <transition name="fade">
      <ul class="rank-list" v-if="activeTab === 'articles'">
        <li
            v-for="(item, index) in articles"
            :key="item.id"
            class="rank-item"
        >
          <div class="rank-order">
            <span v-if="index < 3" class="icon">{{ rankIcons[index] }}</span>
            <span v-else class="number">{{ index + 1 }}</span>
          </div>
          <div class="info">
<!--            <h3 class="title">{{ truncateTitle(item.title , 12) }}</h3>-->
            <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + item.id"
               target="_blank"
               class="router-link-ranking">
              {{ truncateTitle(item.title , 11) }}
            </a>
<!--            <p class="author">@{{ item.username }}</p>-->
            <p class="author" @click="navigateToAuthorPage(item.username , item.createUser)">
                  @{{ item.username }}
            </p>
          </div>
          <div class="stats">
            <span class="likes">❤ {{ item.number }}</span>
          </div>
        </li>
      </ul>
    </transition>

    <!-- 用户排行榜 -->
    <transition name="fade">
      <ul class="rank-list" v-if="activeTab === 'users'">
        <li
            v-for="(user, index) in users"
            :key="user.id"
            class="rank-item"
        >
          <div class="rank-order">
            <span v-if="index < 3" class="icon">{{ rankIcons[index] }}</span>
            <span v-else class="number">{{ index + 1 }}</span>
          </div>
          <img
              :src="user.userPic || avatar"
              alt="头像"
              class="avatar"
              @error="e => e.target.src = avatar"
          >
          <div class="info">
<!--            <h3 class="name">{{ user.username }}</h3>-->
            <p class="name" @click="navigateToAuthorPage(user.username , user.id)">
              @{{ user.username }}
            </p>
            <p class="fans">粉丝 {{ user.followerCount }}</p>
          </div>
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.router-link-ranking {
  color: #2c3e50;
  /* 确保链接不会换行 */
  white-space: nowrap;
  /* 设置过渡效果，使得颜色变化更加平滑 */
  transition: color 0.3s ease;
  text-decoration: none;
}

.router-link-ranking:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
}
.rank-container {
  max-width: 800px;
  margin: 2rem auto;
  //border-radius: 12px;
  //padding: 1.0rem;
}

.tab-switch {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-switch button {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: #f1f3f5;
  color: #495057;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-switch button.active {
  background: #4dabf7;
  color: white;
  box-shadow: 0 4px 6px rgba(77, 171, 247, 0.2);
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 1.1rem;
  margin-bottom: 1rem;
  //background: white;
  //background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  background-color: #fafafa;
  border-radius: 10px;
  transition: transform 0.3s, box-shadow 0.2s;
}

.rank-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.rank-order {
  width: 20px;
  text-align: center;
  margin-right: 1.2rem;
}

.rank-order .icon {
  font-size: 1.8rem;
}

.rank-order .number {
  font-size: 1.2rem;
  color: #868e96;
  font-weight: bold;
}

.cover, .avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 1.5rem;
}

.avatar {
  border-radius: 50%;
}

.info {
  flex: 1;
}

.name {
  margin: 0;
  font-size: 1.0rem;
  color: #212529;
  cursor: pointer; /* 鼠标变为手型 */
  transition: all 0.3s ease; /* 添加平滑过渡效果 */
}
.name:hover {
  color: #007bff; /* 悬停时改变颜色 */
  text-decoration: underline; /* 添加下划线 */
}

.author {
  margin: 0.3rem 0 0;
  color: #868e96;
  font-size: 0.9rem;
  cursor: pointer; /* 鼠标变为手型 */
  transition: all 0.3s ease; /* 添加平滑过渡效果 */
}
.author:hover {
  color: #007bff; /* 悬停时改变颜色 */
  text-decoration: underline; /* 添加下划线 */
}
.fans {
  margin: 0.3rem 0 0;
  color: #868e96;
  font-size: 0.9rem;
}

.stats {
  min-width: 100px;
  text-align: right;
}

.likes {
  background: #fff0f6;
  color: #c2255c;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}



</style>