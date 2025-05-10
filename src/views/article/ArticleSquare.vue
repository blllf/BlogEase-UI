<script lang="ts" setup>
import {Delete, Edit, Plus, Reading , Minus} from "@element-plus/icons-vue";
import {ref , computed } from "vue";

import {deleteByIdsService,adminAddArticleService,deleteArticleService,updateArticleService,
  deleteArticleByIdService , addArticleILikeService , selectAllService ,
  articleCategoryListService , articleCategoryListService2} from "../../api/article.js";
import {selectAllUsersService} from "@/api/user.js";
import {QuillEditor} from "@vueup/vue-quill";
import {ElMessage,ElNotification } from "element-plus";


const tableData = ref()
//文章分类数据模型
const categorys = ref()
//用户数据模型
const user = ref()

//添加表单数据模型
const articleModel = ref({
  id:'',
  title: '',
  categoryId: '',
  coverImg: '',
  content:'',
  state:'',
})

const pageNum = ref(1)
const pageSize = ref(10)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)
const total = ref(120)

const handleSizeChange = (size) => {
  pageSize.value = size;
  selectAll();
}
const handleCurrentChange = (num) => {
  pageNum.value = num;
  selectAll();
}


//用户搜索时选中的分类id
const categoryId=ref('')
const articleTitle = ref('')
const author = ref('')
const title = ref('')
const date1 = ref('')
const date2 = ref('')


//显示文章数据
const articleCategoryList = async () => {
  const result = await articleCategoryListService2();
  categorys.value = result.data;
  selectAll();
}

//获取到所有用户的数据
const articleByUser = async () => {
  const result = await selectAllUsersService();
  user.value = result.data;
  selectAll();
  //console.log(result.data)
}

const selectAll = async () => {
  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    categoryId: categoryId.value ? categoryId.value : null,
    title: articleTitle.value ? articleTitle.value : null,
    author: author.value ? author.value : null,
    testDate1 : date1.value ? date1.value : null ,
    testDate2 : date2.value ? date2.value : null,
  }

  const result = await selectAllService(params);
  //渲染视图
  total.value = result.data.total
  tableData.value = result.data.items;

  //处理数据，分类对应的数字转换为具体的分类名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < categorys.value.length; j++) {
      if (article.categoryId == categorys.value[j].id){
        article.categoryName = categorys.value[j].categoryName;
        article.categoryPic = categorys.value[j].categoryPic
      }
    }
  }
//处理数据，分类对应的数字转换为具体的用户的名字名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < user.value.length; j++) {
      if (article.createUser == user.value[j].id){
        article.createUser = user.value[j].username;
      }
    }
  }

}

articleCategoryList();
articleByUser();
selectAll();

//重置
const reset = () => {
  categoryId.value = ''
  articleTitle.value = ''
  author.value = ''
  date1.value = ''
  date2.value = ''
  selectAll();
}

//查询文章
const readArticleVisible = ref(false)
const readArticle = async (row) => {
  readArticleVisible.value = true;
  //回显数据
  articleModel.value.id = row.id
  articleModel.value.title = row.title
  articleModel.value.categoryName = row.categoryName
  articleModel.value.coverImg = row.coverImg
  articleModel.value.content = row.content
  articleModel.value.categoryPic = row.categoryPic
}

//控制抽屉是否显示
const visibleDrawer = ref(false)
const articleEdit = (row) => {

  visibleDrawer.value = true

  title.value = '修改文章'

  //回显数据
  articleModel.value.title = row.title
  articleModel.value.categoryId = row.categoryId
  articleModel.value.coverImg = row.coverImg
  articleModel.value.content = row.content
  articleModel.value.id = row.id;
  articleModel.value.state = row.state
  articleModel.value.deleted = row.deleted
}


//导入token
import {useTokenStore} from '@/stores/token.js'
import { ElMessage , ElMessageBox } from 'element-plus'
const tokenStore = useTokenStore();
//上传图片成功的回调函数
const uploadSuccess = (result) => {
  articleModel.value.coverImg = result.data;
  //tomcat默认文件上传最大时1MB
  if (articleModel.value.coverImg == null){
    ElMessage.error("上传文件大小不得超过1MB !")
  }
  console.log(result.data)
}



//确认修改
const updateArticle = async () => {
  const result = await updateArticleService(articleModel.value);
  ElMessage.success(result.message ? result.message : '修改成功')
  await selectAll()
  visibleDrawer.value = false
}

//删除文章
const deleteArticle = (row) => {
  console.log(row.id)
  ElMessageBox.confirm(
      '你确认要删除该分类信息吗',
      '温馨提示',
      {
        confirmButtonText : '确认',
        cancelButtonText : '取消',
        type:'warning'
      }
  )
      .then(async () => {
        //调用删除接口
        const result = await deleteArticleService(row.id);
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
        selectAll();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '用户取消了删除',
        })
      })
}

//发布文章 前清空数据
const putArticle = () => {
  visibleDrawer.value = true ;
  title.value = '添加文章'
  articleModel.value = {
    title: '',
    categoryId: '',
    coverImg: '',
    content: ' ',
    state: ''
  }

}

//发布文章
const araddArticle = async () => {
  articleModel.value.state = '已发布';
  //调用接口
  const result = await adminAddArticleService(articleModel.value);
  ElNotification.success({
    title: 'Success',
    message: '发布成功!'
  })
  visibleDrawer.value = false;
  //刷新列表
  await selectAll();
}

//批量删除

const selectedIds = ref()

const handleSelectionChange = (val) => {
  // val 参数包含当前选中的所有行数据
  selectedIds.value = val.map(item => item.id);
  console.log("这里： " + selectedIds.value)
}

const deleteByIds = async () => {

  let params = selectedIds.value
  if (selectedIds.value != '' && selectedIds.value != null ){
    ElMessageBox.confirm(
        '你确认要删除该分类信息吗',
        '温馨提示',
        {confirmButtonText : '确认', cancelButtonText : '取消', type:'warning'}
    ).then(async () => {
          //调用删除接口
          const result = await deleteByIdsService(params);
          ElMessage({type: 'success', message: '删除成功',})
          await selectAll();
        }).catch(() => {
          ElMessage({type: 'info', message: '用户取消了删除',})
        })
  }else {
    ElMessage.error("没有选中数据")
  }
}

</script>

<template>
  <el-card class="box-card">
    <div class="square-card-header">
      <span>站内文章</span>
      <el-button type="primary" @click="putArticle">发布文章</el-button>
    </div>
    <div>
      <hr>
    </div>

    <!-- 对话框 阅读   -->
    <el-dialog v-model="readArticleVisible" width="70%"
               :before-close="handleClose" class="article-dialog"
               :close-on-click-modal="false">
      <div class="article-header">
        <div class="cover-and-title">
          <img v-if="articleModel.coverImg" :src="articleModel.coverImg" alt="文章封面" class="cover-image"/>
          <div v-else class="no-cover">暂无封面</div>
          <div class="title-container">
            <h1 class="article-title">{{ articleModel.title }}</h1>
          </div>
        </div>
      </div>
      <hr/>
      <el-scrollbar class="article-scrollbar">
        <div v-html="articleModel.content" class="square-article-content"></div>
      </el-scrollbar>
    </el-dialog>



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

      <el-form-item label="标题">
        <el-input v-model="articleTitle" placeholder="文章标题" clearable></el-input>
      </el-form-item>

      <el-form-item label="发布人">
        <el-input v-model="author" placeholder="作者名字" clearable></el-input>
      </el-form-item>

        <el-form-item label="选择时间">
          <el-col :span="11">
            <el-date-picker
                v-model="date1"
                type="date"
                placeholder="起始时间"
                style="width: 100%"
            />
          </el-col>
          <span >——</span>
          <el-col :span="11">
            <el-date-picker
                v-model="date2"
                type="date"
                placeholder="目标时间"
                style="width: 100%"
            />
          </el-col>
      </el-form-item>


      <el-form-item>
        <el-button type="primary" @click="selectAll">搜索</el-button>
        <el-button style="margin-left: 30px" @click="reset">重置</el-button>
        <el-button style="margin-left: 30px" type="danger" @click="deleteByIds">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 文章列表    -->
    <el-table :data="tableData" highlight-current-row style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="100" label="序号" />
      <el-table-column label="查看文章" align="center" width="100">
        <template #default="{ row }">
          <el-button size="small" @click="readArticle(row)">
            <el-icon><Reading /></el-icon>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="title" align="center" label="标题" width="280" show-overflow-tooltip/>
      <el-table-column prop="categoryName" align="center" label="分类" />
      <el-table-column prop="createUser" align="center" label="发布人" >
        <template #default="scope">
          <el-tag>{{ scope.row.createUser }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" align="center" label="发表时间" />
      <el-table-column label="操作" align="center" width="100">
        <template #default="{ row }">
          <el-button type="primary" :icon="Edit" circle @click="articleEdit(row)" />
          <el-button type="danger" :icon="Delete" circle @click="deleteArticle(row)" />
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

    <!--  分页  -->
    <div class="demo-pagination-block">
      <el-pagination class="el-p"
                     v-model:current-page="pageNum"
                     v-model:page-size="pageSize"
                     :page-sizes="[10, 15, 20, 30]"
                     :small="small"
                     :disabled="disabled"
                     :background="background"
                     layout="jumper , total, sizes, prev, pager, next"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
      />
    </div>

  </el-card>

  <!-- 抽屉组件  -->
  <el-drawer v-model="visibleDrawer" :title=title direction="rtl" size="50%">
    <!-- 添加文章表单 -->
    <el-form :model="articleModel" label-width="100px" >
      <el-form-item label="文章标题" >
        <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类">
        <el-select placeholder="请选择" v-model="articleModel.categoryId">
          <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id"></el-option>
        </el-select>
      </el-form-item>

<!--      <el-form-item v-if="title == '修改文章' " label="发布状态">
        <el-select v-model="articleModel.state"  placeholder="请选择">
          <el-option label="已发布" value="已发布" />
          <el-option label="草稿" value="草稿" />
        </el-select>
      </el-form-item>-->

      <el-form-item v-if="title == '修改文章'" label="发布状态" >
        <el-input v-model="articleModel.state" placeholder="请输入标题" readonly></el-input>
      </el-form-item>

      <el-form-item label="文章封面">
        <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false"
                   action="/api/upload"
                   name="file"
                   :headers="{'Authorization':tokenStore.token}"
                   :on-success="uploadSuccess"
        >
          <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="文章内容">
        <div class="editor">
          <quill-editor
              theme="snow"
              v-model:content="articleModel.content"
              contentType="html">
          </quill-editor>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" v-if="title == '添加文章' " @click="araddArticle">发布</el-button>
        <el-button type="info" v-if="title == '添加文章' " @click="visibleDrawer = false">取消</el-button>
        <el-button type="primary" v-if="title == '修改文章' " @click="updateArticle">确认</el-button>
        <el-button type="info" v-if="title == '修改文章' " @click="visibleDrawer = false">取消</el-button>
      </el-form-item>

    </el-form>
  </el-drawer>


</template>

<style>

/* 抽屉样式 */
.avatar-uploader {
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

  .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }

  .el-upload:hover {
    border-color: var(--el-color-primary);
  }

  .el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #1a1a1a;
    width: 178px;
    height: 178px;
    text-align: center;
    border: 1px solid #ccc; /* 添加一个1像素宽度的灰色边框 */
  }

}


.header-wrapper {
  display: flex; /* 使用Flexbox布局 */
  align-items: center; /* 垂直对齐标题和图片 */
  justify-content: space-between;/* 水平居中标题和图片 */
}

.title {
  display: flex;
  margin-right: 400px;
}


.inline-img {
  margin-left: 10px;
  width: 80px; /* 设置图片的宽度 */
  height: auto; /* 设置图片的高度 */
}

.inline-img3 {
  margin-left: 200px;
  width: 500px; /* 设置图片的宽度 */
  height: 300px; /* 设置图片的高度 */
  border-radius: 5px;
}

.article-content {
  font-size: 16px;
  font-family: Arial, sans-serif;
  line-height: 2;
  margin-left: 20px;
}

.el-p{
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}


.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.square-card-header{
  display: flex;
  justify-content: space-between;
}



.editor{
  width: 100%;
  height: 400px;
}


/* 对话框整体样式 */
.article-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 封面与标题容器 */
.cover-and-title {
  display: flex;
  align-items: center;
  background-color: #FDF5E6;
  padding: 10px;
  border-radius: 12px;
}

.cover-image {
  max-width: 120px; /* 调整封面图片宽度 */
  height: auto;
  object-fit: cover;
  margin-right: 20px; /* 图片与标题之间的间距 */
  border-radius: 8px;
}

.no-cover {
  font-size: 16px;
  color: #666;
  margin-right: 20px;
}

.title-container {
  flex-grow: 1; /* 占据剩余空间 */
}

/* 文章标题样式 */
.article-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0;
}

/* 滚动条容器样式 */
.article-scrollbar {
  height: 70vh; /* 根据视口高度设置内容区域高度 */
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

/* 文章内容样式 */
.square-article-content {
  font-size: 15px;
  color: #333;
  line-height: 1.8;
  //word-break: break-word;
}

.article-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
  border-radius: 4px;
}

.article-content p {
  margin-bottom: 15px;
}

.article-content h1,
.article-content h2,
.article-content h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.article-content a {
  color: #007bff;
  text-decoration: none;
}

.article-content a:hover {
  text-decoration: underline;
}
</style>