<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import {ElMessage} from 'element-plus'
import {sendEmailService , findPasswordService} from '../api/user'

const dynamicValidateForm = ref({
  email : '',
  code : '',
  newPassword : '',
  rePassword : ''
})

//校验密码的函数
const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入确认密码'))
  } else if (value !== dynamicValidateForm.value.newPassword) {
    callback(new Error("请确保两次输入的密码一样"))
  } else {
    callback()
  }
}


//检验密码规则
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


//提交修改
const submitForm = async () => {
  let params = {
    email: dynamicValidateForm.value.email,
    code: dynamicValidateForm.value.code,
    new_pwd: dynamicValidateForm.value.newPassword,
    re_pwd: dynamicValidateForm.value.rePassword
  }

  const result = await findPasswordService(params);

  if (result.code === 0){
    alert('修改成功')
  }

}


//点击发送邮件
const sendEmail = async () => {
  const emailValue = dynamicValidateForm.value.email

  if (emailValue.includes('@')){

    alert('正在发送....')

    const result = await sendEmailService(dynamicValidateForm.value.email);

    ElMessage.success("发送成功，验证码已发送到你的邮箱 ！！")
  }

}

//返回到登录界面
import router from '../router/indexs'
const backLogin = () => {
  router.push('/')
}


</script>


<template>

    <div align="center" class="forgetPwd" >

      <el-form
          style="max-width: 600px"
          :model="dynamicValidateForm"
          label-width="auto"
          :rules="rules"
          class="formPosition"
      >
        <el-card style="width: 600px; border-radius: 20px" shadow="hover">
          <h1 style="display: inline ; margin-right: 20px ;" >找回密码</h1><h5 style="color: red ; display: inline">注意 : 该账号已提前绑定了邮箱</h5>
          <h5></h5>
          <el-form-item prop="email"  label="Email" >
            <el-input v-model="dynamicValidateForm.email"  />
          </el-form-item>

          <el-form-item prop="code"  label="验证码" style="display: flex; align-items: center;">
            <el-input placeholder="请注意大小写！！！" v-model="dynamicValidateForm.code" style="flex: 1;" />
            <el-button type="primary" style="margin-left: 50px;" @click="sendEmail"> 发送邮件 </el-button>
          </el-form-item>

          <el-form-item prop="newPassword"  label="新密码" >
            <el-input type="password" show-password v-model="dynamicValidateForm.newPassword" />
          </el-form-item>

          <el-form-item prop="rePassword"  label="确认新密码">
            <el-input type="password" show-password v-model="dynamicValidateForm.rePassword" />
          </el-form-item>

          <el-form-item>
            <div class="footer">
              <el-button type="primary" @click="submitForm()" style="margin-right: 50px;">提交</el-button>
              <el-button @click="backLogin">返回登录</el-button>
            </div>
          </el-form-item>
        </el-card>

      </el-form>
    </div>





</template>

<style>
.forgetPwd {
  border-radius: 10px;
  display: flex;
  //justify-content: center;
  //align-items: center;
  height: 100vh; /* 确保最小高度为视窗高度 */
  background-image: url('../assets/forgetpwd.png'); /* 替换为你的图片路径 */
  background-size: cover; /* 确保图片覆盖整个容器 */
  background-position: center; /* 将图片居中 */
  background-repeat: no-repeat; /* 防止图片重复 */
  position: relative; /* 为了给内部元素定位 */


}

.formPosition{
  margin-top: 250px;
  margin-left: 350px;
}



.footer{
  display: flex;
  margin-left: 130px;
  /*justify-content: flex-start; !* 水平方向上靠右对齐 *!
  align-items: flex-end; !* 垂直方向上靠下对齐 *!*/
  /*padding: 20px; !* 根据需要添加内边距 *!*/
}

</style>


