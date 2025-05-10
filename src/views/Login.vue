<script setup>
import {onMounted, ref , computed} from 'vue'
import { ElMessage , ElLoading } from 'element-plus'

//控制注册与登录表单的显示， 默认显示注册
const isRegister = ref(false)

//定义登录注册需要的数据模型
const registerData = ref({
  rememberMe: false,
  username:'',
  password:'',
  rePassword:''
})


//调用后台的接口，完成注册
import {userRegisterService , usernameFromToken} from '../api/user.js'
const register = async () => {
  console.log("执行 register")
  if (registerData.value.password !== registerData.value.rePassword){
    ElMessage.error("再次输入密码不能为空..")
  }else {
    let result = await userRegisterService(registerData.value);
    ElMessage.success('注册成功')
  }
}


//登录函数
const loading = ref(false)
const isAnimating = ref(false); // 新增：用于控制动画状态
import {useTokenStore} from '../stores/token.js'
import router from "@/router/indexs.js";
import {userLoginService} from '../api/user.js'
const tokenStore = useTokenStore();
const login = async () => {
  // 在提交前再次验证所有字段
  const validUsername = validateUsername();
  const validPassword = validatePassword();
  if (!validUsername || !validPassword) {
    alert("输入无效")
    return; // 如果有无效字段，阻止提交
  }
  if(registerData.value.username && registerData.value.password) {
    // 设置加载状态为 true 和开始动画
    loading.value = true;
    isAnimating.value = true;
    //调用接口完成登录
    let result = await userLoginService(registerData.value);
    //把的到的token存储到pinia中
    tokenStore.setToken(result.data)
    // 如果用户选择了“记住我”，设置一个长期有效的Cookie
    if (registerData.value.rememberMe){
      setRememberMeCookie(result.data);
    }
    if (result.code === 0) {
      if (registerData.value.username !== "admin") {
        await handleLoginSuccess("/article/index", "登录成功");
      } else {
        await handleLoginSuccess("/homepage", "登录成功");
      }
    } else {
      ElMessage.error("服务错误");
      loading.value = false;
      isAnimating.value = false;
    }
  }
}

// 定义一个通用的延迟跳转函数
const handleLoginSuccess = async (redirectPath, message) => {
  setTimeout(async () => {
    loading.value = false;
    isAnimating.value = false;
    await router.push(redirectPath); // 跳转到指定页面
    ElMessage.success(message); // 显示成功消息
  }, 1000);
};

// 设置记住我的Cookie
const setRememberMeCookie = (rememberMeToken) => {
  const date = new Date();
  date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 一周有效期
  document.cookie = `rememberMe=${rememberMeToken}; expires=${date.toUTCString()}; path=/`;
};
// 获取记住我的Cookie
const getRememberMeCookie = (name) => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// 页面加载时检查记住我的Cookie
onMounted(async () => {
  //console.log('onMounted hook is executed'); // 添加这一行
  const rememberMeToken = getRememberMeCookie('rememberMe');
  //console.log("1:" + rememberMeToken)
  if (rememberMeToken) {
    // 使用rememberMeToken向后端请求用户信息
    try {
      const response = await usernameFromToken(rememberMeToken);
        registerData.value.username = response.data.username;
        registerData.value.password = response.data.password;
        registerData.value.rememberMe = true; // 自动选中“记住我”复选框
    } catch (error) {
      ElMessage.warning("没有你的登录信息!")
      //ElMessage.error("登录失败")
    }
  }
});

const forgetPassword = () => {
  router.push('/forgetPwd')
}


//定义函数清空数据模型
const clearRegisterData = () => {
  registerData.value={
    username: '',
    password: '',
    rePassword: ''
  };
}

// 验证信息
const validationMessages = ref({
  username: '',
  password: '',
  rePassword: ''
});
//const checked = ref(false);
const isFocused = ref('');
// 验证规则
const minLen = 5;
const maxLen = 16;
// 用户名校验函数
const validateUsername = () => {
  if (registerData.value.username.length < minLen) {
    validationMessages.value.username = '不能为空,长度为5~16位非空字符';
    /*setTimeout(() => {
      // 添加 'show' 类来触发淡入效果
      document.querySelector('.error-message').classList.add('show');
    }, 0);*/
    return false;
  } else if (registerData.value.username.length > maxLen) {
    validationMessages.value.username = '不能为空,长度为5~16位非空字符';
    return false;
  } else {
    validationMessages.value.username = '';
    return true;
  }
};
// 密码校验函数
const validatePassword = () => {
  if (registerData.value.password.length < minLen) {
    validationMessages.value.password = '不能为空,长度为5~16位非空字符';
    return false;
  } else if (registerData.value.password.length > maxLen) {
    validationMessages.value.password = '不能为空,长度为5~16位非空字符';
    return false;
  } else {
    validationMessages.value.password = '';
    return true;
  }
};

// 验证密码校验函数
const validateRePassword = () => {
  if (registerData.value.rePassword !== registerData.value.password) {
    validationMessages.value.rePassword = '密码输入不一致';
    return false;
  } else {
    validationMessages.value.rePassword = '';
    return true;
  }
};


// 表单是否有效
const isFormValid = computed(() =>
    !validationMessages.value.username && !validationMessages.value.password && !validationMessages.value.rePassword
);

// 输入框聚焦事件
const onFocus = (event) => {
  isFocused.value = event.target.name;
  switch (isFocused.value) {
    case 'username':
      validationMessages.value.username = '';
      break;
    case 'password':
      validationMessages.value.password = '';
      break;
    case 'rePassword':
      validationMessages.value.rePassword = '';
      break;
  }
};

// 输入框失焦事件
const onBlur = (event) => {
  const field = event.target.name;
  switch (field) {
    case 'username':
      validateUsername();
      break;
    case 'password':
      validatePassword();
      break;
    case 'rePassword':
      validateRePassword();
      break;
  }
  setTimeout(() => {
    isFocused.value = '';
  }, 100);
};

</script>

<template>
  <div  class="login-container">
    <div class="platform-tagline">
      个人创作与交流平台
    </div>
    <div v-if="isRegister"  class="box-card">
      <h2 class="login-card-header">注册</h2>
      <form @submit.prevent="register" class="form-group">
        <div class="input-with-feedback">
          <input
              v-model="registerData.username"
              type="text"
              placeholder="请输入账号"
              name="username"
              @focus="onFocus"
              @blur="onBlur"
              :class="{ 'focused': isFocused === 'username', 'invalid': !!validationMessages.username }"
              class="custom-input"
          />
          <span v-if="validationMessages.username" class="error-message">{{ validationMessages.username }}</span>
        </div>
        <div class="input-with-feedback">
          <input
              v-model="registerData.password"
              type="password"
              placeholder="请输入密码"
              name="password"
              @focus="onFocus"
              @blur="onBlur"
              :class="{ 'focused': isFocused === 'password', 'invalid': !!validationMessages.password }"
              class="custom-input"
          />
          <span v-if="validationMessages.password" class="error-message">{{ validationMessages.password }}</span>
        </div>
        <div class="input-with-feedback">
          <input
              v-model="registerData.rePassword"
              type="password"
              placeholder="请再次输入密码"
              name="rePassword"
              @focus="onFocus"
              @blur="onBlur"
              :class="{ 'focused': isFocused === 'rePassword', 'invalid': !!validationMessages.rePassword }"
              class="custom-input"
          />
          <span v-if="validationMessages.rePassword" class="error-message">{{ validationMessages.rePassword }}</span>
        </div>
        <button type="submit" class="login-btn" :disabled="!isFormValid">注册</button>
        <div>
          <a href="#" class="forget-password" @click="isRegister=false;clearRegisterData();">← 返回</a>
        </div>
      </form>
    </div>
    <div v-else class="box-card">
      <h2 class="login-card-header">登录</h2>
      <form @submit.prevent="login" class="form-group">
        <div class="input-with-feedback">
          <input
              v-model="registerData.username"
              type="text"
              placeholder="请输入账号"
              name="username"
              @focus="onFocus"
              @blur="onBlur"
              :class="{ 'focused': isFocused === 'username', 'invalid': !!validationMessages.username }"
              class="custom-input"
          />
          <span v-if="validationMessages.username" class="error-message">{{ validationMessages.username }}</span>
        </div>
        <div class="input-with-feedback">
          <input
              v-model="registerData.password"
              type="password"
              placeholder="请输入密码"
              name="password"
              @focus="onFocus"
              @blur="onBlur"
              :class="{ 'focused': isFocused === 'password', 'invalid': !!validationMessages.password }"
              class="custom-input"
          />
          <span v-if="validationMessages.password" class="error-message">{{ validationMessages.password }}</span>
        </div>

        <div class="remember-me">
          <label>
            <input type="checkbox" v-model="registerData.rememberMe" />记住我
          </label>
          <a href="#" class="forget-password" @click="forgetPassword">忘记密码？</a>
        </div>
<!--        <button type="submit" class="login-btn" :disabled="!isFormValid">登录</button>-->
        <button type="submit" class="login-btn" :disabled="!isFormValid || isLoading">
          <span v-if="!loading">登录</span>
          <span v-else>
            <span>登录</span>
            <span class="dots" :class="{ 'animate': isAnimating }"></span>
          </span>
        </button>
        <div>
          <a href="#" class="forget-password" @click="isRegister = true;clearRegisterData();">点击注册 →</a>
        </div>
      </form>
      <div class="admin-tip">
        <span>管理员请使用专属账号登录</span>
      </div>
    </div>

  </div>


</template>

<style  scoped>
/* 样式 */
.login-container {
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 确保最小高度为视窗高度 */
  background-image: url('../assets/login.png'); /* 替换为你的图片路径 */
  background-size: cover; /* 确保图片覆盖整个容器 */
  background-position: center; /* 将图片居中 */
  background-repeat: no-repeat; /* 防止图片重复 */
  position: relative; /* 为了给内部元素定位 */
}

.box-card {
  width: 350px;
  padding: 3rem;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px); /* 模糊效果使内容更清晰 */
}

.login-card-header {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 2.5rem; /* 加大上下间距 */
  font-size: 28px; /* 增大登录字体 */
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 使用 gap 属性来控制表单元素之间的间距 */
}

.custom-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.remember-me {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 14px; /* 减小字体大小 */
}

.forget-password {
  color: #66b1ff;
  text-decoration: underline; /* 添加下划线 */
  cursor: pointer;
  transition: color 0.3s ease; /* 添加颜色过渡效果 */
}

.forget-password:hover {
  color: #409eff; /* 改变悬停时的颜色 */
}

.forget-password:active {
  color: #1989fa; /* 改变按下时的颜色 */
}


.login-btn {
  appearance: none;
  outline: none;
  border: none;
  background-color: #409eff;
  color: white;
  padding: 11px;
  border-radius: 10px;
  font-size: 16px; /* 稍微增大按钮文本 */
  cursor: pointer;
  transition: transform 0.3s ease;
}

.login-btn:hover {
  transform: scale(1.05);
}

.login-btn:active {
  transform: scale(0.95);
}

.focused {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.input-with-feedback {
  position: relative; /* 使子元素可以相对此容器定位 */
}

.custom-input {
  appearance: none;
  outline: none;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  padding: 12px 18px; /* 确保有足够的内边距以避免文本重叠 */
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%; /* 确保输入框宽度适应父容器 */
  box-sizing: border-box; /* 确保内边距不会增加元素的总宽度 */
}

.error-message {
  color: #D50000; /* 更柔和但醒目的深红色 */
  font-size: 12px; /* 稍微增大字体大小以提高可读性 */
  font-family: 'Roboto', sans-serif; /* 使用无衬线字体 */
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px; /* 增加顶部间距 */
  white-space: nowrap;
  padding:  0 5px;  /* 增加内边距 */
  z-index: 1;
  border-radius: 4px; /* 圆角边框 */
  //background-color: rgba(255, 255, 255, 0.9); /* 轻微半透明白色背景 */
  //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 轻微阴影效果 */
  //opacity: 0;
  //transition: opacity 0.3s ease-in-out;
}
/*.error-message.show {
  opacity: 1;
}*/

.custom-input.invalid {
  border-color: red;
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.3);
}

.dots {
  display: inline-block;
  width: 24px; /* 足够的空间放置三个点 */
  text-align: left;
}

@keyframes ellipsis {
  0%   { content: " "; }
  33%  { content: ". "; }
  66%  { content: ".. "; }
  100% { content: "... "; }
}

.animate::after {
  content: "";
  animation: ellipsis 1s steps(3, end) infinite;
}

.admin-tip {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9em;
}

.platform-tagline {
  position: absolute;
  top: 120px; /* 距离顶部20px */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  font-size: 42px; /* 字体大小 */
  font-weight: bold; /* 加粗字体 */
  color: #ffffff; /* 白色文字 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 1); /* 添加阴影以提高可读性 */
  background: rgba(0, 0, 0, 0.3); /* 半透明背景 */
  padding: 10px 25px; /* 内边距 */
  border-radius: 10px; /* 圆角 */
  z-index: 10; /* 确保文字在背景图片之上 */
}



</style>