<script lang="ts" setup>
import {Delete, Edit, Timer} from '@element-plus/icons-vue'
import {ElMessageBox,ElMessage} from 'element-plus'
import {ref , onMounted} from "vue";
import {isPassService,articlesAuditService,articleCategoryListService2} from '../../api/article'
import {selectAllUsersService} from "../../api/user";
import {userInfoStore} from '../../stores/userInfo'
const infoStore = userInfoStore();

const tableData = ref([
  {
    id: 3,
    title: '河南一日游',
    content: '',
    coverImg: '',
    state: '草稿',
    categoryId: 2,
    createUser:'白龙飞',
    createTime:'2024-6-2 12-12-12',
    updateTime:'',
  },
])
const articleModel = ref({
  id:'',
  title: '',
  categoryId: '',
  coverImg: '',
  content:'',
  state:'',

})

//用户数据模型
const user = ref([
  {
    id: 1 ,
    username: '',
    password: '',
    nickname: '',
    email: '',
    userPic: '',
    createTime: '',
    updateTime: ''
  }
])


//文章分类数据模型
const categorys = ref([
  {
    id: 3,
    categoryName: '美食',
    categoryAlias: 'my',
    createTime: '2023-09-02 12:06:59',
    updateTime: '2023-09-02 12:06:59',
    categoryPic: ''
  },
])


//显示文章分类数据
const articleCategoryList = async () => {
  const result = await articleCategoryListService2();
  categorys.value = result.data;
  await selectAuditArticles();
}

articleCategoryList();

//获取到所有用户的数据
const articleByUser = async () => {
  const result = await selectAllUsersService();
  user.value = result.data;

}
articleByUser();

//改进：携带参数查询
//用户搜索时选中的分类id
const categoryId=ref('')
const date1 = ref('')
const date2 = ref('')

const selectAuditArticles = async () => {
  let params = {
    categoryId: categoryId.value ? categoryId.value : null,
    testDate1 : date1.value ? date1.value : null ,
    testDate2 : date2.value ? date2.value : null,
  }
  const result = await articlesAuditService(params);
  tableData.value = result.data;
  //处理数据，分类对应的数字转换为具体的用户的名字名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < user.value.length; j++) {
      if (article.createUser == user.value[j].id){
        article.createUser = user.value[j].username;
      }
    }
  }
  //处理数据，分类对应的数字转换为具体的分类名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < categorys.value.length; j++) {
      if (article.categoryId == categorys.value[j].id){
        article.categoryName = categorys.value[j].categoryName;
        article.newCoverImg = article.coverImg;
        article.coverImg = categorys.value[j].categoryPic;
      }
    }
  }
}

selectAuditArticles();

//重置
const reset = async () => {
  categoryId.value = '';
  date1.value = '';
  date2.value = ''
  console.log("重置")
  await selectAuditArticles();
}

//通过
const articleAccess = (row) =>{
  const id = row.id
  //alert("通过" + id)
  let params = {
    label: 0,
    state: '已发布',
    articleId: row.id,
    userId: row.createUser,
    sendId: infoStore.info.username,
    message: '已通过'
  }
  ElMessageBox.confirm(
      '你确认审核通过吗?',
      '温馨提示',
      {
        confirmButtonText : '确认',
        cancelButtonText : '取消',
        type:'warning'
      }
  ).then(async () => {
        await isPassService(params);
        ElMessage({
          type: 'success',
          message: '已通过...',
        })
        await selectAuditArticles();
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '用户取消了操作',
        })
      })
}

//不通过2.0
const flag = ref(false)
const params = ref({})
const message = ref('未通过')
let socket = ref(null)

const articleNoAccess2 = async (row) => {
  flag.value = !flag.value;
  params.value = {
    label: 3,
    state: '未通过',
    articleId: row.id,
    userId: row.createUser,
    sendId: infoStore.info.username,
    message: message.value
  }
}

//提交信息
const submitMessage = async () => {
  params.value.message = message.value;
  await isPassService(params.value);
  ElMessage({
    type: 'success',
    message: '操作成功',
  })
  await selectAuditArticles();
  flag.value = !flag.value;
}

//是否通过对话框
const cancel = () => {
  flag.value = false;
}

const viewArticleVisible = ref(false)

const showArticle = async (row) => {
  viewArticleVisible.value = true;
  //alert("文章"+row.id)
  //回显数据
  articleModel.value.id = row.id
  articleModel.value.title = row.title
  articleModel.value.categoryName = row.categoryName
  articleModel.value.categoryPic = row.coverImg
  articleModel.value.content = row.content

  articleModel.value.newCoverImg = row.newCoverImg

  const content = articleModel.value.content
  const index = content.indexOf('</p>')
  articleModel.value.newContent1 = index != -1 ? content.substring(0 , index + 4) : content

  articleModel.value.newContent2 = index != -1 ? content.substring(index + 4) : content
}




</script>

<template>

  <el-card>
    <h3 style="font-weight: lighter">文章审核</h3>

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
        <el-button type="primary" @click="selectAuditArticles">搜索</el-button>
        <el-button style="margin-left: 20px" type="warning" @click="reset">重置</el-button>
<!--        <el-button style="margin-left: 100px" type="danger" @click="deleteByIds">批量通过/不通过</el-button>-->
      </el-form-item>
    </el-form>

    <el-table :data="tableData" style="width: 100%;">
      <el-table-column label="序号" align="center" type="index" width="100" />
      <el-table-column prop="title" align="center"  label="标题" width="350"/>
      <el-table-column prop="content" align="center" label="内容" width="180"  >
        <template #default="{ row }">
          <el-button size="small" @click="showArticle(row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" align="center"  label="提交时间" width="280" >
        <template #default="scope">
            <el-icon><timer /></el-icon>
            <span style="margin-left: 5px">{{scope.row.updateTime}}</span>
        </template>
      </el-table-column>

      <el-table-column prop="createUser" align="center" label="作者" width="180"  >
        <template #default="scope">
          <el-tag>{{ scope.row.createUser }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="250">
        <template #default="{ row }">
          <el-button type="primary" size="small"   @click="articleAccess(row)" >通过</el-button>
<!--          <el-button type="danger"  size="small"  @click="articleNoAccess(row)" >不通过</el-button>-->
          <el-button type="danger"  size="small"  @click="articleNoAccess2(row)" >不通过</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据"></el-empty>
      </template>

    </el-table>


  </el-card>

  <!-- 对话框 阅读   -->
  <el-dialog v-model="viewArticleVisible" width="70%"
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


  <!-- 通过/不通过对话框-->
  <div>
    <el-dialog v-model="flag" title="输入信息(原因)" width="30%" style="border-radius: 10px">
      <el-input v-model="message" placeholder="请输入信息" type="textarea" :rows="4"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitMessage">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

</template>

<style scoped>
.rounded-dialog {
  border-radius: 20px;
}


.inline-img2 {
  margin-left: 200px;
  width: 500px; /* 设置图片的宽度 */
  height: 300px; /* 设置图片的高度 */
  border-radius: 5px;
}

</style>