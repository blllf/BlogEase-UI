<script setup>
import { ref } from 'vue'


const passwordInfo = ref({
  oldPassword : '',
  newPassword: '',
  rePassword:''
})

//校验密码的函数
const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入确认密码'))
  } else if (value !== passwordInfo.value.newPassword) {
    callback(new Error("请确保两次输入的密码一样"))
  } else {
    callback()
  }
}



const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {min: 5 , max: 16 , message: '长度为5~16位非空字符' , trigger: 'blur'}
  ],
  rePassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {validator: checkRePassword, trigger: 'blur'}
  ]
}

//修改用户的信息
import {updatePasswordService} from '@/api/user.js'
import {ElMessage} from "element-plus";
import router from '@/router/indexs.js'
import {useTokenStore} from '@/stores/token.js'
const tokenStore = useTokenStore()
const updatePassword = async () => {
  let params = {
    old_pwd: passwordInfo.value.oldPassword,
    new_pwd: passwordInfo.value.newPassword,
    re_pwd: passwordInfo.value.rePassword,
  }
  //console.log(params)
  const result = await updatePasswordService(params);
  if (result.code == 0){
    ElMessage.success('修改成功，请重新登录')
    //跳转页面 ， 清空pinia中的token信息
    tokenStore.removeToken

    router.push('/')
  }else {
    ElMessage.error(result.message?result.message:'修改失败')
  }


}

</script>
<template>
  <el-row>
    <el-col :span="12">
      <el-form :model="passwordInfo" :rules="rules" label-width="100px" size="large">
        <el-form-item label="原密码" size="default">
          <el-input v-model="passwordInfo.oldPassword" ></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword" size="default">
          <el-input type="password" show-password v-model="passwordInfo.newPassword"></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="rePassword" size="default">
          <el-input type="password" show-password v-model="passwordInfo.rePassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="default"  @click="updatePassword">保存</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>