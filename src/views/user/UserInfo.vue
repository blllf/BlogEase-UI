<script setup>
import { ref } from 'vue'
import {userInfoStore} from '@/stores/userInfo.js'



const infoStore = userInfoStore();

/*const userInfo = ref({  ...infoStore.info

})*/

const userInfo = ref({
  id: infoStore.info.id,
  username: infoStore.info.username,
  nickname: infoStore.info.nickname,
  email: infoStore.info.email,
  userPic: infoStore.info.userPic
})


//检查用户是否添加邮箱
const inspectionInfo = () => {
  //ElMessage.warning('请及时添加邮箱')
  if (userInfo.value.email.includes('@')){
  }else {
    ElMessage.warning('请及时添加邮箱')
  }
}

inspectionInfo();


const rules = {
  nickname: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    {
      pattern: /^\S{2,10}$/,
      message: '昵称必须是2-10位的非空字符串',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

//修改用户的信息
import {updateUserService} from '@/api/user.js'
import {ElMessage} from "element-plus";

const updateUser = async () => {
  const result = await updateUserService(userInfo.value);
  infoStore.setInfo(userInfo.value)
  await ElMessage.success('修改成功');

}


</script>
<template>
  <!--    <template #header>
      <div class="header">
        <span>基本资料</span>
      </div>
    </template>-->
  <el-row>
    <el-col :span="12">
      <el-form :model="userInfo" :rules="rules" label-width="100px" size="large">
        <el-form-item label="登录名称">
          <el-input v-model="userInfo.username" disabled size="default"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname" size="default">
          <el-input v-model="userInfo.nickname" maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email" size="default">
          <el-input v-model="userInfo.email"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="default" type="primary" @click="updateUser">保存</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>