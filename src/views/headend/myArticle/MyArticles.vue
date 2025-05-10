<script lang="ts" setup>
//回显文章分类
import { articleCategoryListService2 , readArticleService , deleteArticleService ,
  updateArticleService , articleAddService , articleListSelectService,articleCategoryListService} from '../../../api/article'
import { ref , onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {Plus,Reading,Edit,Delete} from '@element-plus/icons-vue'
import {useRouter} from "vue-router";
import router from '../../../router/indexs'
import {truncateContent} from "@/api/genericFunctions.js";


//添加表单数据模型
const articleModel = ref({
  id: '',
  title: '',
  categoryId: '',
  coverImg: '',
  content:'',
  state:''
})


//导入token
import {useTokenStore} from '../../../stores/token'
import { ElMessage , ElMessageBox } from 'element-plus'
const tokenStore = useTokenStore();


const pageNum = ref(1)
const pageSize = ref(8)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)
const total = ref(120)


onMounted(() => {
  articleCategoryList();
  articleList();
})

const handleSizeChange = (size) => {
  pageSize.value = size;
  articleList();
}
const handleCurrentChange = (num) => {
  pageNum.value = num;
  articleList();
}


//文章分类数据模型
const categorys = ref([
  {
    id: 3,
    categoryName: '美食',
    categoryAlias: 'my',
    createTime: '2023-09-02 12:06:59',
    updateTime: '2023-09-02 12:06:59'
  },
])

//用户搜索时选中的分类id
const categoryId=ref('')
const state = ref('')
const deleted = ref('')

const tableData = ref([
  {
    id: 3,
    title: '河南一日游',
    content: '',
    coverImg: '',
    state: '草稿',
    categoryId: 2,
    createTime:'',
    updateTime:'',
    deleted: 9,
  }
])


const articleCategoryList = async () => {
  const result = await articleCategoryListService2();
  categorys.value = result.data;
}

//获取文章列表数据
const articleList = async () => {
  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    categoryId: categoryId.value ? categoryId.value : null,
    deleted: deleted.value ? deleted.value : null
  }
  const result = await articleListSelectService(params);
  //渲染视图
  total.value =  result.data.total;
  tableData.value = result.data.items;
  //处理数据，分类对应的数字转换为具体的分类名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < categorys.value.length; j++) {
      if (article.categoryId == categorys.value[j].id){
        article.categoryName = categorys.value[j].categoryName;
      }
    }
  }

  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    if(article.deleted == 0){
      article.deleted = '已通过'
    }else if (article.deleted == 1){
      article.deleted = '审核中'
    }else {
      article.deleted = '未通过'
    }
  }
}




const editArticle = (id) => {
  const url = window.location.origin + '/my_blog/creation/' + id;
  window.open(url , '_blank');
}
const deleteArticle = (id) => {
  ElMessageBox.confirm(
      '你确认要删除该文章吗',
      '温馨提示',
      {confirmButtonText : '确认', cancelButtonText : '取消', type:'warning'}
  ).then(async () => {
    //调用删除接口
    const result = await deleteArticleService(id);
    ElMessage({type: 'success', message: '删除成功',})
    await getArticleData();
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '用户取消了删除',
    })
  })
}

//tage 属性type
const getTagType = (deletedValue) => {
  switch (deletedValue){
    case '审核中':
      return 'warning';
    case '未通过':
      return 'danger'
    case '已通过':
      return 'success'
  }
}

//重置
const reset = async () => {
  categoryId.value = '';
  deleted.value = ''
  await articleList();
}


</script>

<template>
  <div>
    <!-- 搜索表单 -->
    <el-form :inline="true"  class="demo-form-inline">
      <el-form-item label="文章分类">
        <el-select
            v-model="categoryId"
            placeholder="请选择"
            clearable>
          <el-option v-for="c in categorys" :key = "c.id" :label="c.categoryName" :value="c.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select
            v-model="deleted"
            placeholder="请选择"
            clearable>
          <el-option label="未通过" value=" 3 " />
          <el-option label="审核中" value=" 1 " />
          <el-option label="待发布" value=" 2 " />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button style="margin-left: 20px" type="primary" @click="articleList">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="article-list">
      <el-scrollbar class="article-scrollbar">
        <div v-for="(article, index) in tableData" :key="index" class="article-item">
          <div class="resource-article-image">
            <img :src="article.coverImg" alt="Article Image">
          </div>
          <div class="article-content">
            <span class="myarticles-title">{{ article.title }}</span>
            <p v-html="truncateContent(article.content, 70)"></p>
            <div class="article-meta">
              <span>创作时间 {{ article.updateTime }} </span>
              <el-tag v-if="article.state === '未通过'" :type="getTagType(article.deleted)">{{ article.deleted }}</el-tag>
              <el-tag v-if="article.state === '发布中' && article.deleted != '未通过' " :type="getTagType(article.deleted)">{{ article.deleted }}</el-tag>
              <el-tag v-if="article.state === '草稿'">待发布</el-tag>
              <!-- 编辑和删除按钮 -->
              <div class="action-buttons">
                <span class="edit-btn" @click="editArticle(article.id)">编辑</span>
                <span class="delete-btn" @click="deleteArticle(article.id)">删除</span>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <!--  分页  -->
    <div class="demo-pagination-block">
      <el-pagination class="el-p"
                     v-model:current-page="pageNum"
                     v-model:page-size="pageSize"
                     :page-sizes="[5, 10, 15, 20]"
                     :small = true
                     :disabled="disabled"
                     :background="background"
                     layout="jumper , total, sizes, prev, pager, next"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
      />
    </div>



  </div>




</template>

<style scoped>

.article-scrollbar {
  height: 60vh; /* 根据视口高度设置内容区域高度 */
  border-top: 1px solid #ddd;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background-color: #fff;
  padding: 20px;
}

/* 滚动条美化 */
.article-scrollbar /deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}

.article-scrollbar /deep/ .el-scrollbar__thumb {
  background-color: #aaa;
  border-radius: 4px;
}



.myarticles-title {
  text-decoration: none;
  color: #747bff;
  font-size: 16px;
}




.el-p{
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.demo-form-inline .el-input {
  --el-input-width: 180px;
}

.demo-form-inline .el-select {
  --el-select-width: 180px;
}


.article-list {
  display: flex;
  flex-direction: column;
}

.article-item {
  display: flex;
  margin-bottom: 10px; /* 减少间距 */
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px; /* 减少间距 */
  position: relative; /* 添加相对定位，用于控制按钮位置 */
}

.resource-article-image {
  flex: 0 0 120px; /* 缩小图片宽度 */
  margin-right: 10px; /* 减少间距 */
}

.resource-article-image img {
  width: 100%; /* 图片宽度占满容器 */
  height: 80px; /* 自动调整高度 */
  //max-height: 100px; /* 限制图片最大高度 */
  object-fit: cover; /* 确保图片完整显示，避免拉伸或裁剪 */
  border-radius: 4px; /* 添加圆角效果 */
}

.article-content {
  flex: 1;
}

.article-content h2 {
  font-size: 16px; /* 缩小标题字体 */
  margin: 0 0 5px; /* 减少标题上下间距 */
}

.article-content p {
  font-size: 12px; /* 缩小描述字体 */
  margin: 0 0 5px; /* 减少描述上下间距 */
  color: #666; /* 使用灰色文字 */
}

.article-meta {
  display: flex;
  gap: 8px; /* 减少元数据间距 */
  font-size: 12px; /* 缩小元数据字体 */
  color: #999; /* 使用浅灰色文字 */
}
.action-buttons {
  display: none; /* 默认隐藏按钮 */
  margin-left: 500px;
  gap: 8px; /* 按钮间距 */
}

/* 鼠标悬停时显示按钮 */
.article-item:hover .action-buttons {
  display: flex; /* 显示按钮 */
}

.edit-btn,
.delete-btn {
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  color: #007bff; /* 蓝色文字 */
  font-size: 12px; /* 字体大小 */
}

.edit-btn:hover,
.delete-btn:hover {
  text-decoration: underline; /* 鼠标悬停时添加下划线 */
}


</style>