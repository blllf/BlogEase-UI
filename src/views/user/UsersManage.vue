<script setup>
import {selectAllUsersByAdminService,addUserAdminService,deleteUserByAdminService,selectAllUsersService ,updateUserAdminService} from '../../api/user.js'
import {ref} from "vue";
import avatar from "@/assets/default.png";
import {Edit, Delete,Right} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";


import {QuillEditor} from "@vueup/vue-quill";
import axios from "axios";


const tableData = ref([
  {
    id:'',
    userPic: '无',
    username: 'Tom',
    nickname: 'California',
    password: '',
    email: 'Los Angeles',
    createTime: '2016-05-03',
    updateTime: '',
  },
])

const userData = ref(
  {
    id:'',
    userPic: '',
    username: '',
    password: '',
    nickname: '',
    email: '',
  },
)

//定义表单校验规则
const rules = {
  username:[
    {required:true , message: '请输入用户名' , trigger: 'blur'},
    {min: 5 , max: 16 , message: '长度为5~16位非空字符' , trigger: 'blur'}
  ],
  password:[
    {required:true , message: '请输入密码' , trigger: 'blur'},
    {min: 5 , max: 16 , message: '长度为5~16位非空字符' , trigger: 'blur'}
  ],
  email: [
    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const updateUserVisible = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const title = ref(" ")
const username = ref("")
const useremail = ref("")
const nickname = ref("")
const total = ref(120)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

const handleSizeChange = (size) => {
  pageSize.value = size;
  findAllUsers();
}
const handleCurrentChange = (num) => {
  pageNum.value = num;
  findAllUsers();
}

//改进 ： 携带参数查询
const findAllUsers = async () => {
  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    username: username.value?username.value:null,
    email: useremail.value?useremail.value:null,
    nickname: nickname.value?nickname.value:null
  }
  //const result = await selectAllUsersService(params);
  const result = await selectAllUsersByAdminService(params);
  //渲染视图
  total.value =  result.data.total;
  tableData.value = result.data.items;
}
findAllUsers()



//删除用户
const deleteUser = (row) => {
  ElMessageBox.confirm('你确认要删除该用户信息吗', '温馨提示',
      {confirmButtonText : '确认', cancelButtonText : '取消', type:'warning'}
  ).then(async () => {
        //调用删除接口
        const result =  await deleteUserByAdminService(row.id);
        ElMessage({type: 'success', message: '删除成功',})
        await findAllUsers();
      }).catch(() => {
        ElMessage({type: 'info', message: '用户取消了删除',})
      })
}

//修改用户
const updateUser = (row) => {
  updateUserVisible.value = true
  title.value = '修改用户'
  //回显数据
  userData.value.id = row.id
  userData.value.username = row.username
  userData.value.password = row.password
  userData.value.email = row.email
  userData.value.nickname = row.nickname
}
//确认修改
const confirmUpdateUser = async () => {
  const params = userData.value
  if (params.password === '' || params.email === ''){
    ElMessage.error("密码或邮箱不能为空")
  }else {
    const result = await updateUserAdminService(params);
    updateUserVisible.value = false;
    if (result.code !== 0){
      ElMessage.error("修改失败" + result.message)
    }
    ElMessage.success("修改成功")
    await findAllUsers()
  }

}

//添加用户
const addUser = () => {
  updateUserVisible.value = true;
  title.value = '添加用户'
  userData.value = {
    id:'',
    userPic: '',
    username: '',
    password: '',
    nickname: '',
    email: '',
  }
}
const confirmAddUser = async () => {
  const params = userData.value
  const result = await addUserAdminService(params);
  updateUserVisible.value = false
  ElMessage.success("添加成功")
  await findAllUsers()
}

const picVisible = ref(false)
const showPic = (row) => {
  picVisible.value = true
  userData.value.id = row.id
  userData.value.userPic = row.userPic
}

//数据导出
const exportUserData = async () => {
  //把页面重定向到
  window.location.href = 'http://localhost:8081/fileExport?fileName=用户数据'
  ElMessage.success("已导出...")
  await findAllUsers()
}

//下载图片
const handleDownload = () => {
  
}

//重置
const reset = async () => {
  username.value = '';
  nickname.value = '';
  useremail.value = '';
  await findAllUsers();
}





</script>

<template>

  <!--  查看图片-->
  <el-dialog
      v-model="picVisible"
      width="800px"
      style="border-radius: 10px">
    <el-form :model="userData">
      <el-form-item class="clean-form-item">
        <!-- 极简容器 -->
        <div class="clean-container">
          <!-- 精简后的图片展示 -->
          <img :src="userData.userPic || avatar" class="pure-preview" alt="用户头像">
        </div>
      </el-form-item>
      <!-- 紧凑按钮组 -->
      <div class="pure-footer">
<!--        <el-button type="text" @click="handleDownload">下载</el-button>-->
        <a :href="userData.userPic" download="example.jpg" class="download">下载</a>
      </div>
    </el-form>
  </el-dialog>

  <!-- 对话框 修改   -->
  <el-dialog v-model="updateUserVisible" :title="title" width="600"  class="rounded-dialog">
    <el-form :model="userData" label-width="100px" :rules="rules">
<!--      <el-form-item label="头像">
        <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false">
          <img v-if="userData.userPic" :src="userData.userPic" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>-->

      <el-form-item label="用户名" prop="username" style="width: 500px; margin-top: 25px">
        <el-input v-if="title === '修改用户' " v-model="userData.username" disabled></el-input>
        <el-input v-if="title === '添加用户' " v-model="userData.username"></el-input>
      </el-form-item>

      <el-form-item label="昵称(选填)" prop="nickname" style="width: 500px; margin-top: 25px " >
        <el-input v-model="userData.nickname" ></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password" style="width: 500px; margin-top: 25px" >
        <el-input v-model="userData.password" ></el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email" style="width: 500px;margin-top: 25px">
        <el-input v-model="userData.email" ></el-input>
      </el-form-item>

      <div  style="display: flex; margin-left: 100px; margin-top: 30px">
        <el-button v-if="title === '修改用户' " type="primary" style="margin-left: 50px"  @click="confirmUpdateUser">确认</el-button>
        <el-button v-if="title === '添加用户' " type="primary" style="margin-left: 50px"  @click="confirmAddUser">添加</el-button>
        <el-button type="info" style="margin-left: 50px" @click="updateUserVisible = false">取消</el-button>
      </div>
    </el-form>
  </el-dialog>

  <el-card>
    <div class="manage-card-header">
      <span>人员管理</span>
      <el-button type="primary" @click="addUser">添加用户</el-button>
    </div>

    <div >
      <hr>
    </div>

    <!-- 搜索表单 -->
    <el-form :inline="true"  class="demo-form-inline">
      <el-form-item label="用户名">
        <el-input placeholder="请输入姓名" clearable  v-model="username" />
      </el-form-item>

      <el-form-item label="昵称">
        <el-input placeholder="请输入昵称" clearable   v-model="nickname" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input placeholder="请输入邮箱" clearable v-model="useremail" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="findAllUsers">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="exportUserData" >导出<el-icon><Right /></el-icon></el-button>
      </el-form-item>
    </el-form>

    <!-- 用户数据    -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" align="center" label="序号" />
      <el-table-column prop="userPic" label="头像" align="center" width="100" >
        <template #default="{row}">
          <!-- 使用 scope.row.userPic 来获取图片链接 -->
          <img :src="row.userPic?row.userPic:avatar" alt="无图片" @click="showPic(row)" class="avatar" style="border-radius: 50%">
        </template>
      </el-table-column>

      <el-table-column prop="username" label="用户名" align="center" width="150" />
      <el-table-column prop="nickname" label="昵称" align="center" width="120" />
      <el-table-column prop="password" label="密码" align="center" width="150" />
      <el-table-column prop="email" label="邮箱" align="center" width="250" />
      <el-table-column prop="followerCount" label="粉丝" align="center" width="100" />
      <el-table-column prop="attentionCount" label="关注" align="center" width="100" />
      <el-table-column prop="createTime" label="创建时间" align="center" width="250" />
      <el-table-column prop="updateTime" label="修改时间" align="center" width="250" />

      <el-table-column label="操作" align="center" width="200">
        <template #default="{row}">
          <el-button link type="primary" size="large" @click="updateUser(row)">编辑</el-button>
          <el-button link type="danger" size="large" @click="deleteUser(row)">删除</el-button>
          <el-button link type="warning" size="large">禁用</el-button>
        </template>
      </el-table-column>

    </el-table>

    <!--  分页  -->
    <div class="demo-pagination-block">
      <el-pagination class="el-p"
                     v-model:current-page="pageNum"
                     v-model:page-size="pageSize"
                     :page-sizes="[5, 10, 15, 20]"
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

</template>

<style scoped>

/* 纯净对话框样式 */
.clean-dialog {
  border-radius: 4px;
}

/* 极简容器 */
.clean-container {
  width: 100%;
  min-height: 300px;
  max-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  position: relative;
}

/* 纯净图片样式 */
.pure-preview {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}


/* 紧凑底部 */
.pure-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

/* 表单项目优化 */
.clean-form-item {
  margin-bottom: 0;
}

.clean-form-item >>> .el-form-item__label {
  padding-bottom: 8px;
  color: #606266;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}


.avatar {
  width: 40px;
  height: 40px;
}

.manage-card-header{
  display: flex;
  justify-content: space-between;
}

.download {
  /* 去掉下划线 */
  text-decoration: none;
  /* 设置字体颜色为白色 */
  color: #4dabf7; /* 白色 */
  /* 鼠标悬停时变为浅蓝色 */
  transition: color 0.3s ease; /* 平滑过渡效果 */
}

.download:hover {
  color: #e6a23c; /* 浅蓝色 */
}



.avatar-uploader {
  /*:deep() {}*/
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
</style>