<script setup>
import {onMounted, ref} from 'vue'
import {addArticleILikeService, deleteArticleByIdService, selectArticleByUserIdService, selectById, selectNumAndRankService} from '../../api/article.js'
import {selectByIdService} from '../../api/user.js'
import {addCommentService,findAllCommentsService,deleteCommentsService} from '../../api/comments.js'
import {findLikeCountService,incrementCountService,decrementCountService} from '../../api/thumbsUp.js'
import {userInfoStore} from '../../stores/userInfo.js'
import {CircleCheck,SuccessFilled , Plus, User, Check , SemiSelect,Comment,DeleteFilled} from "@element-plus/icons-vue";
import {ElMessage, ElNotification} from "element-plus";
import avatar from "@/assets/default.png";
import thumpup from "@/assets/article-images/thumbsup.png"
import thumpup2 from "@/assets/article-images/thumbsup2.png"
import collection from "@/assets/article-images/collection.png"
import collection2 from "@/assets/article-images/collection2.png"
import commentspic from "@/assets/article-images/comments.png"
import {attentionService , unAttentionService ,existsFollowService, getFollowerCountService} from '../../api/user.js'
import { useRouter  } from 'vue-router';

const router = useRouter();
const readCount = ref('12.3k')
//文章模拟数据
const article = ref({
  id: 1,
  coverImg: '12',
  createUser: 'bailongfei',
  categoryId: 2,
  title: 'bailongfei测试！ ',
  createTime: '2020-12-1',
  updateTime: '2020-12-1',
  content: ' hello world 内容',
  state: '已发布',
  deleted: 9,
})
//点赞数据模型
const userLike = ref({
  likedUserId : '',
  likedPostId : '',
  status : '',
  number : 0
})
//用户数据模型
const user = ref({
  id: 1,
  username: '',
  password: '',
  nickname: '',
  email: '',
  userPic: '',
  createTime: '',
  updateTime: ''
})
//评论的数据模型
const comments = ref([
  {
    username: '',
    userPic: '',
    content: '',
    articleId: '',
    createTime: '',
    parentCommentId: '',
    replyComments : [{
      username: '',
      userPic: '',
      content: '',
      articleId: '',
      createTime: '',
      parentCommentId: ''
    }]
  }
])
const form = ref({
  userId: '',
  content: '',
  articleId: '',
  parentCommentId: '',
})
//用户衍生数据模型
const numAndRank = ref({
  createUser: 1,
  articleCount: 1,
  peopleRank: 1,
  numberLikes:1
})
const infoStore = userInfoStore();
const flag = ref(true)
const dateFd = ref('');
const commentInput = ref(null);// 输入框的引用
const messageAt = ref('请输入评论信息...');
const visibleDrawer = ref(false)
const isAttention = ref(false)
const followerCount = ref(133)

onMounted(async () => {
  const articleId = Number(window.location.href.match(/\/article\/details\/(\d+)/)[1]);
  //评论文章ID
  form.value.articleId = articleId
  //获取点赞数量
  const resultRedis = await findLikeCountService(articleId);
  userLike.value = resultRedis.data;
  //查找文章
  const result = await selectById(articleId);
  if (result && result.data) {
    article.value = result.data;
  } else {
    console.error("Failed to fetch article data");
  }
  //获取个人信息文章数-点赞量
  const numberResult = await selectNumAndRankService(result.data.createUser);
  numAndRank.value = numberResult.data
  //查询文章作者用户
  const resultUser = await selectByIdService(result.data.createUser);
  user.value = resultUser.data
  //获取粉丝数
  await getFollowCount(user.value.id)
  //查询个人收藏数据库是否包含该数据然后再调整flag的值
  const result1 = await selectArticleByUserIdService(infoStore.info.id)
  for (let i = 0; i < result1.data.length; i++) {
    const article = result1.data[i];
    if (article.id === articleId)
      flag.value = false;
  }
  //判断用户是否关注
  await existsFollowing();
})

const existsFollowing = async () => {
  // 设置标志 目的：不弹出消息框
  //instance.defaults.headers.common['category_add'] = 'true';
  let params = {followerId: infoStore.info.id, followingId: user.value.id}
  const isExists = await existsFollowService(params);
  //delete instance.defaults.headers.common['category_add'];
  if (isExists.code === 0 && isExists.data !== 'null') {
    isAttention.value = true
  }
}

const getFollowCount = async (param) => {
  console.log('param' , param)
  const result = await getFollowerCountService(param);
  followerCount.value = result.data
}


//格式化时间
const formattedDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  dateFd.value = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}
     ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

//查看评论
const findAllComments = async () => {
  //父评论
  let params = {
    parentId: '-1',
    articleId: form.value.articleId,
  }
  // 调用后端接口获取评论数据
  const result = await findAllCommentsService(params);
  comments.value = result.data;
  for (let i = 0; i < comments.value.length; i++) {
    const date = comments.value[i].createTime
    await formattedDate(date);
    comments.value[i].createTime = dateFd.value
    if (comments.value[i].replyComments.length > 0){
      for (let j = 0; j < comments.value[i].replyComments.length; j++) {
        const date1 = comments.value[i].replyComments[j].createTime
        await formattedDate(date1)
        comments.value[i].replyComments[j].createTime = dateFd.value
      }
    }
  }
}

const getUsername = (userId) => {
  const result = selectByIdService(userId);

}


//回复评论
const reply = (id , username) => {
  // 获取输入框实例并使其获取焦点
  commentInput.value.focus();
  form.value.parentCommentId = id
  messageAt.value = "@" + username
}
//发布评论
const addComment = async () => {
  // 检查内容是否为空
  if (!form.value.content.trim()) {
    ElMessage.warning("评论内容不能为空");
    return; // 如果为空，直接返回，不执行后续逻辑
  }

  form.value.userId = infoStore.info.id;
  const result = await addCommentService(form.value);
  if (result.code === 0){
    ElMessage.success("发布成功")
    await findAllComments();
    form.value.content = ''
  }else{
    ElMessage.error("发布失败")
  }
}
//展示所有评论 ， 目前效果不太好
const exportCommentsFlag = ref(false)
const exportComments = () => {
  exportCommentsFlag.value = !exportCommentsFlag.value
}
//删除评论
const deleteComment = async (id) => {
  let params = {
    parentId: id,
    articleId: form.value.articleId
  }
  const result = await deleteCommentsService(params);
  await findAllComments();
}

const showComment = async () => {
  visibleDrawer.value = true;
  await findAllComments();
}

//点赞
const thumbsUp = async () => {
  const result = await incrementCountService(article.value.id);
  if (result.data === 1){userLike.value.status = result.data}
  const result2 = await findLikeCountService(article.value.id);
  userLike.value = result2.data;
}
//取消点赞
const noThumbsUp = async () => {
  await decrementCountService(article.value.id);
  const result2 = await findLikeCountService(article.value.id);
  userLike.value = result2.data;
}
//收藏
const Collection = async (articleId) => {
  await addArticleILikeService(articleId);
  ElNotification.success({
    title: 'Success',
    message: '收藏成功 ！'
  })
  flag.value = false;
}
//删除收藏表中的数据
const cancelCollection = async (articleId) => {
  await deleteArticleByIdService(articleId);
  ElNotification.warning({
    title: 'Success',
    message: '已取消收藏 ！'
  })
  flag.value = true;
}

//点击关注
const toggleFollow = async () => {
  let params = {
    followerId: infoStore.info.id,
    followingId: user.value.id
  }
  if (isAttention.value){
    const result = await unAttentionService(params);
    if (result.code === 0){
      isAttention.value = !isAttention.value;
    }
    await getFollowCount(user.value.id)
  }else {
    const result = await attentionService(params);
    if (result.code === 0){
      isAttention.value = !isAttention.value;
    }
    await getFollowCount(user.value.id)
  }

}

const navigateToAuthorPage = (username , id) => {
  const resolved = router.resolve({
    path: '/article/peopleCentral',
    query: {p: username , id: id}
  });
  // 使用window.open在新标签页中打开链接
  window.open(resolved.href, '_blank');
};

const toggleExpand = (commentId) => {
  const comment = comments.value.find(item => item.id === commentId);
  if (comment) {
    comment.isExpanded = !comment.isExpanded;
  }
}

const getReplyToUsername = (parentCommentId) => {
  // 定义一个递归函数来查找评论
  const findCommentById = (comments) => {
    for (const comment of comments) {
      if (comment.id === parentCommentId) {
        return comment.username; // 找到匹配的评论，返回用户名
      }
      if (comment.replyComments && comment.replyComments.length > 0) {
        // 如果有子评论，递归查找
        const username = findCommentById(comment.replyComments);
        if (username) return username; // 如果找到，直接返回
      }
    }
    return null; // 没有找到，返回 null
  };
  // 调用递归函数从顶层评论开始查找
  const username = findCommentById(comments.value);
  // 返回用户名或默认值 "未知用户"
  return username || '未知用户';
};



</script>

<template>
  <div class="blog-container">
    <!-- 左侧作者信息 -->
    <aside class="author-sidebar">
      <div class="author-card">
        <div class="author-header">
          <img :src="user.userPic" class="author-avatar">
          <div class="author-meta">
            <h3 class="author-name" @click="navigateToAuthorPage(user.username , user.id)">{{ user.nickname }}</h3>
          </div>
          <button
              :class="['follow-btn', { 'active': isAttention }]"
              @click="toggleFollow"
          >
            {{ isAttention ? '已关注' : '+ 关注' }}
          </button>
        </div>

        <div class="author-stats">
          <div class="stat-item">
            <span class="stat-value">{{ followerCount }}</span>
            <span class="stat-label">粉丝</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{numAndRank.articleCount}}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{numAndRank.numberLikes}}</span>
            <span class="stat-label">获赞</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧文章内容 -->
    <main class="article-main">
      <div class="article-wrapper">
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <time class="publish-time">{{ article.updateTime }}</time>
            <span class="read-count">阅读 {{ readCount }}</span>
          </div>
        </header>
        <hr/>

        <article
            class="article-content"
            v-html="article.content"
        ></article>

      </div>
    </main>
  </div>
  <!-- 底部操作栏 -->
  <div class="action-bar">
    <div class="action-group">
      <div v-if="userLike.number !== 0" style="font-size: 15px;">
        <span>{{userLike.number}}</span>
      </div>
      <div>
        <img v-if="userLike.status === 0 " :src="thumpup" alt="点赞" @click="thumbsUp" class="thumbsUp-button"/>
        <img v-if="userLike.status === 1 " :src="thumpup2" alt="取消点赞" @click="noThumbsUp" class="thumbsUp-button"/>
      </div>
      <div v-if="article.deleted === 0 && article.state === '已发布' ">
        <img v-if="flag === true" :src="collection" alt="收藏" class="collection-button" @click="Collection(article.id)"/>
        <img v-if="flag === false" :src="collection2" alt="取消收藏" class="collection-button" @click="cancelCollection(article.id)"/>
      </div>
      <div style="margin-left: 10px">
        <img :src="commentspic" alt="评论" @click="showComment" class="comment-button">
      </div>
    </div>
  </div>


  <!-- 评论 抽屉组件  -->
  <el-drawer v-model="visibleDrawer" title="评论"  direction="ltr" size="40%">
    <div>
      <el-card :data="comments" style="height: 550px" shadow="never">
        <el-scrollbar height="500px">
          <ul>
            <li v-for="(item , index) in comments" :key="index" style="list-style-type: none">
              <div style="float: left">
                <img :src="item.userPic?item.userPic:avatar" alt="图片"  style="width: 40px; height: 40px ;border-radius: 50%"/>
              </div>
              <div style="margin-left: 50px; display: flex; align-items: center;">
                <span style="font-size: 16px; color: #333; font-weight: bold;">{{ item.username }}</span>
                <span style="font-size: 14px; color: #888; margin-left: 10px;">{{ item.createTime }}</span>
              </div>
              <div style="margin-left: 50px; margin-top: 5px">
                <span style="font-size: 17px">{{item.content}}</span>
              </div>
              <div style="margin-left: 50px ;margin-top: 10px;margin-bottom: 20px">
                <el-button link @click="reply(item.id , item.username)">回复</el-button>
                <el-button v-if="item.username === infoStore.info.username " link @click="deleteComment(item.id)"><el-icon><DeleteFilled /></el-icon></el-button>
<!--                <el-button v-if="item.replyComments.length > 0" link @click="exportComments">-&#45;&#45;点击展开</el-button>-->
                <el-button v-if="item.replyComments.length > 0" link @click="toggleExpand(item.id)">  {{ item.isExpanded ? "---点击收起" : "---点击展开" }}</el-button>
              </div>

              <ul style="margin-left: 30px" v-if="item.isExpanded && item.replyComments.length > 0 ">
                <li v-for="(replyComment , replyIndex) in item.replyComments" :key="replyIndex" style="list-style-type: none">
                  <div style="float: left">
                    <img :src="replyComment.userPic?replyComment.userPic:avatar" alt="图片"  style="width: 40px; height: 40px ; border-radius: 50%"/>
                  </div>
                  <div style="margin-left: 50px;display: flex; align-items: center;" >
                    <span style="font-size: 16px; color: #333; font-weight: bold;"> {{replyComment.username}} @ {{getReplyToUsername(replyComment.parentCommentId)}}</span>
                    <span style="font-size: 14px; color: #888; margin-left: 10px;">{{replyComment.createTime}}</span>
                  </div>
                  <div style="margin-left: 50px;margin-top: 5px">
                    {{replyComment.content}}
                  </div>
                  <div style="margin-left: 50px ; margin-bottom: 20px; margin-top: 10px">
                    <el-button link @click="reply(replyComment.id , replyComment.username)">回复</el-button>
                    <el-button v-if="replyComment.username === infoStore.info.nickname " link @click="deleteComment(replyComment.id)"><el-icon><DeleteFilled /></el-icon></el-button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </el-scrollbar>
      </el-card>
    </div>


    <!-- 发布评论区域 -->
    <div style="margin-top: 20px">
      <el-card style="height: 250px">
        <el-form :model="form">
          <el-form-item style="height: 150px">
            <el-input :placeholder="messageAt" v-model="form.content" type="textarea" :rows="5" ref="commentInput" />
          </el-form-item>
          <el-form-item style="margin-top: 20px; margin-left: 90%">
            <el-button type="primary" @click="addComment">发布</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-drawer>



</template>

<style scoped>
.blog-container {
  display: flex;
  width: 90%;
  margin: 20px auto;
  gap: 30px;
}

/* 左侧作者信息 */
.author-sidebar {
  flex: 0 0 280px;
}

.author-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.author-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.author-meta {
  text-align: center;
  margin-bottom: 15px;
}

.author-name {
  font-size: 18px;
  color: #333;
  margin: 0 0 5px;
  cursor: pointer; /* 鼠标变为手型 */
  transition: all 0.3s ease; /* 添加平滑过渡效果 */
}
.author-name:hover {
  color: #007bff; /* 悬停时改变颜色 */
  text-decoration: underline; /* 添加下划线 */
}


.follow-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.follow-btn:hover {
  background: #0056b3;
}

.follow-btn.active {
  background: #4caf50; /* 较浅的绿色 */
  color: white;
}

.follow-btn.active:hover {
  background: #45a049; /* 悬停时更深一点的绿色 */
}

.author-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 右侧文章区域 */
.article-main {
  flex: 1;
  min-width: 0;
}

.article-wrapper {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 30px;
  position: relative;
}

.article-header {
  margin-bottom: 30px;
}

.article-title {
  font-size: 28px;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 15px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

/* 文章内容样式 */
.article-content {
  line-height: 1.3;
  color: #333;
  font-size: 16px;
}

.article-content :deep(h1) {
  font-size: 24px;
  margin: 30px 0 20px;
  color: #1a1a1a;
}

.article-content :deep(pre) {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
}

.article-content :deep(code) {
  font-family: Consolas, Monaco, monospace;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0; /* 动态计算左侧留白 */
  right: 0;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
  display: flex; /* 使用flex布局 */
  justify-content: flex-end; /* 将子元素对齐到右侧 */
  padding: 0 20px; /* 添加一些左右内边距 */
}

.action-group {
  margin-right: 200px;
  padding: 12px 0;
  display: flex;
  gap: 20px;
  align-items: center; /* 垂直居中对齐 */
}

.thumbsUp-button,
.collection-button,
.comment-button {
  width: 30px; /* 统一图标大小 */
  height: 30px;
  cursor: pointer;
}



.action-btn.active .icon {
  fill: #007bff;
}

</style>