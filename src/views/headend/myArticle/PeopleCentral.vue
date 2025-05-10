<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";
import {userInfoStore} from '../../../stores/userInfo.js'
import {useTokenStore} from '../../../stores/token.js'
import Resource from "@/views/headend/myArticle/Resource.vue";
import Picture from "@/views/headend/myArticle/Picture.vue";
import ILikeArticles from "@/views/headend/myArticle/ILikeArticles.vue";
import MyArticles from "@/views/headend/myArticle/MyArticles.vue";
import { ElMessage , ElNotification as notify } from 'element-plus'
import type { TabsPaneContext } from 'element-plus'
import {ArrowUp, ArrowDown, Edit, Plus, Upload} from "@element-plus/icons-vue";
import {selectNumAndRankService} from "../../../api/article"
import {updateAvatarService,updatePasswordService,updateEmailOrNickService,peopleInfoService} from "../../../api/user";
import avatar from "@/assets/default.png";
import { useRoute , useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const activeIndex = ref('1')
const infoStore = userInfoStore();
const tokenStore = useTokenStore();


const onBack = () => {
  router.push('/article/index')
}


//用户数据模型
const user = ref({
  username: '',
  userPic: ''
})

const pwdInfo = ref({
  oldPassword : '',
  newPassword: '',
  rePassword:''
})

const numAndRank = ref({
  createUser: 1,
  articleCount: 1,
  peopleRank: 1
})

const paramP = ref(route.query.p)
const paramId = ref(route.query.id)


// 监听 route.query 的变化
watch(
    () => route.query,
    (newQuery) => {
      // 当查询参数变化时，更新 paramP 和 paramId
      paramP.value = newQuery.p || null; // 如果没有 p 参数，则设置为 null
      paramId.value = newQuery.id || null; // 如果没有 id 参数，则设置为 null
    },
    { immediate: true } // 立即执行一次监听器
);

onMounted(async () => {
  await getUserInfo();
});

//查询用户个人信息
const getUserInfo = async () => {
  const result = await peopleInfoService(paramId.value);
  const result2 = await selectNumAndRankService(paramId.value)
  user.value = result.data
  numAndRank.value = result2.data
}



const showDetailsFlag = ref(false)
const seeDetails = () => {
  showDetailsFlag.value = !showDetailsFlag.value;
}



// -------------------------------

const activeName = ref('')
const drawer = ref(false)
const isEditing = ref(false)
const isEmail = ref(false)
const inputValue = ref(infoStore.info.nickname)
const inputEmailValue = ref('')

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  /*if (isEditing) {
    inputValue.value = user.value.nickname;
  }*/
}

const emailEdit = () => {
  isEmail.value = !isEmail.value;
  /*if (isEmail) {
    inputEmailValue.value = user.value.email;
  }*/
}

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



const confirmUpdate = async () => {
  if (user.value.nickname == null || user.value.nickname == ''){
    ElMessage.warning("昵称不能为空")
  }
  //参数
  let params = {
    nickname: user.value.nickname,
    username: infoStore.info.username
  }
  //后端接口
  const result = await updateEmailOrNickService(params);
  if (result.code === 0) {
    ElMessage.success("修改成功")
    isEditing.value = false
    infoStore.setInfo(user.value)
  }
}

const confirmUpdateE = async () => {

  if (user.value.email == null || user.value.email == ''){
    ElMessage.warning("邮箱不能为空")
  }
  //参数
  let params = {
    email: user.value.email,
    username: infoStore.info.username
  }
  //后端接口
  const result = await updateEmailOrNickService(params);
  if (result.code === 0) {
    ElMessage.success("修改成功")
    isEmail.value = false
    infoStore.setInfo(user.value)
  }
}

// -----------------------------
const activeName2 = ref('first')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

//修改密码
//校验密码的函数
const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入确认密码'))
  } else if (value !== pwdInfo.value.newPassword) {
    callback(new Error("请确保两次输入的密码一样"))
  } else {
    callback()
  }
}
const rulers = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {min: 5 , max: 16 , message: '长度为5~16位非空字符' , trigger: 'blur'}
  ],
  rePassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {validator: checkRePassword, trigger: 'blur'}
  ]
}
const updatePassword = async () => {
  let params = {
    old_pwd: pwdInfo.value.oldPassword,
    new_pwd: pwdInfo.value.newPassword,
    re_pwd: pwdInfo.value.rePassword,
  }
  //console.log(params)
  const result = await updatePasswordService(params);
  if (result.code === 0){
    ElMessage.success('修改成功，请重新登录')
    //跳转页面 ， 清空pinia中的token信息
    tokenStore.removeToken
    router.push('/')
  }else {
    ElMessage.error(result.message?result.message:'修改失败')
  }
}

const uploadRef = ref()
const selectedFile = ref(null); // 选中的文件对象
//用户头像地址
const imgUrl= ref(infoStore.info.userPic)

//上传图片，点击上传图片后的回调函数
const uploadSuccess = (result) => {
  if (result.data == null){
    ElMessage.error("照片大小不得超过 5MB")
  }else {
    imgUrl.value = result.data;
    console.log('img' , imgUrl.value)
  }

}

/*const updateAvatar = async () => {
  //if (!selectedFile.value) return;
  const result = await updateAvatarService(imgUrl.value);
  if (result.code === 0){
    ElMessage.success(result.message?result.message:'修改成功')
    //修改pinia中的数据
    infoStore.info.userPic = imgUrl.value;
  }
}*/
const updateAvatar = async () => {
  if (!imgUrl.value) {
    ElMessage.warning('请先选择图片');
    return;
  }
  try {
    // 调用后端接口更新头像
    const result = await updateAvatarService(imgUrl.value);
    // 检查返回结果
    if (result.code === 0) {
      ElMessage.success(result.message || '修改成功');
      // 更新 Pinia 中的用户头像数据
      infoStore.info.userPic = imgUrl.value;
    } else {
      ElMessage.error(result.message || '修改失败');
    }
  } catch (error) {
    console.error('更新头像失败:', error);
    ElMessage.error('更新头像失败，请稍后重试');
  }
};

// 处理文件选择事件
const handleFileChange = (file) => {
  selectedFile.value = file.raw;
};



</script>

<template>
  <!-- height: 100vh; 设置外层div的高度为视口高度的100%，这样背景颜色就会覆盖整个视口高度。-->
  <div class="background">
    <div style="width: 90%; margin-top: 50px">
      <el-card style="width: 98.5%" shadow="never">

        <div aria-label="A complete example of page header">
          <el-page-header  @back="onBack" >
            <template #content>
              <div style="float: left">
                <img :src="user.userPic?user.userPic:avatar" alt="头像" style="width: 80px; height: 80px; border-radius: 50%">
              </div>

              <div v-if="user.username === 'admin' " style="margin-left: 100px; margin-top: 5px; display: flex; align-items: center;">
                  <span style="font-size: 16px; color: #333; font-weight: bold;">管理员</span>
              </div>
              <div v-else style="margin-left: 100px; margin-top: 5px; display: flex; align-items: center;">
                <span style="font-size: 16px; color: #333;">普通用户</span>
              </div>

              <div style="margin-left: 100px; margin-top: 5px">
                <span style="font-size: 20px">{{user.nickname }}</span>
              </div>

              <div style="margin-left: 100px; margin-top: 5px">
                <span style="font-size: 18px; font-weight: bold"> {{numAndRank.articleCount}} </span>
                <span style="font-size: 15px; font-weight: lighter"> 原创 </span>
                <span style="font-weight: lighter; margin-left: 15px; margin-right: 15px" >|</span>
                <span style="font-size: 18px; font-weight: bold"> {{numAndRank.peopleRank}} </span>
                <span style="font-size: 15px; font-weight: lighter"> 排行 </span>
              </div>



            </template>

            <div style="margin-left: 180px ; margin-top: 10px">
              <el-button v-if="showDetailsFlag === false" link @click="seeDetails" style="font-size: 15px;font-weight: lighter">查看详细资料<el-icon><ArrowDown /></el-icon></el-button>

              <div v-if="showDetailsFlag === true">
                <el-row type="flex" >
                  <el-col>
                    <div style="font-weight: lighter; font-size: 14px; margin-top: 5px ; margin-bottom: 5px">名称：{{ user.username }}</div>
                  </el-col>
                  <el-col >
                    <div style="font-weight: lighter; font-size: 14px; margin-top: 5px ; margin-bottom: 5px">邮箱：{{ user.email }}</div>
                  </el-col>
                  <el-col >
                    <div style="font-weight: lighter; font-size: 14px; margin-top: 5px ; margin-bottom: 5px">IP属地：河南</div>
                  </el-col>
                  <el-col >
                    <div style="font-weight: lighter; font-size: 14px; margin-top: 5px ; margin-bottom: 5px">加入时间：{{ user.createTime }}</div>
                  </el-col>
                </el-row>
              </div>
              <el-button v-if="showDetailsFlag === true" link @click="seeDetails" style="font-size: 15px;font-weight: lighter;margin-top: 7px;">收起详细资料<el-icon><ArrowUp /></el-icon></el-button>
            </div>

            <template #extra>
              <div v-if="user.username === infoStore.info.username" class="flex items-center">
<!--                <el-button>设置</el-button>-->
                <el-button type="primary" class="ml-2" @click="drawer = true">编辑资料</el-button>
              </div>
            </template>
          </el-page-header>


        </div>



      </el-card>

      <div style="display: flex; margin-top: 20px;">
        <el-card style="width: 30%; margin-right: 5px; height: 600px" shadow="never">
          <!-- 第二个卡片的内容 -->
          <div>
            <el-calendar >
              <template #date-cell="{ data }">
                <p :class="data.isSelected ? 'is-selected' : ''">
                  {{ data.day.split('-').slice(2).join('-') }}
                  {{ data.isSelected ? '✔️' : '' }}
                </p>
              </template>
            </el-calendar>
          </div>
        </el-card>

        <el-card style="width: 68%;" shadow="never">
          <el-tabs

              type="card"
              class="demo-tabs"
          >
            <el-tab-pane label="资源" name="resource">
<!--              <Resource v-if="activeName === 'resource'" />-->
              <Resource/>
            </el-tab-pane>
            <el-tab-pane v-if="user.username === infoStore.info.username" label="最近" name="Recent">
<!--              <Message v-if="activeName === 'message'" />-->
              <MyArticles/>
            </el-tab-pane>
            <el-tab-pane label="个人收藏" name="collection">
<!--              <Collection v-if="activeName === 'collection'" />-->
              <ILikeArticles/>
            </el-tab-pane>
            <el-tab-pane label="精美图片" name="pictures">
<!--              <Pictures v-if="activeName === 'pictures'" />-->
              <Picture/>
            </el-tab-pane>
          </el-tabs>


        </el-card>
      </div>
    </div>
  </div>

  <!--编辑资料对话框  -->
  <el-drawer v-model="drawer" title="个人资料" :with-header="true" size="50%">
    <el-tabs v-model="activeName2" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="first">
        <div>
          <div style="display: flex; align-items: center;margin-top: 20px; margin-left: 10px">
            <div>
              <span style="font-weight: lighter; font-size: 18px">用户昵称</span>
              <span style="margin-left: 25px; font-size: 18px" v-if="isEditing === false">{{infoStore.info.nickname}}
          <el-button style="margin-left: 10px" type="primary" link @click="toggleEdit"><el-icon><Edit /></el-icon>编辑</el-button></span>
            </div>

            <!-- 使用v-if来控制输入框的显示与隐藏 -->
            <div v-if="isEditing" style="margin-left: 20px; margin-top: 15px">
              <el-form :model="user" :rules="rules">
                <el-form-item prop="nickname">
                  <el-input
                      v-model="user.nickname"
                      style="width: 240px"
                      placeholder="Please input"
                  />
                  <el-button style="margin-left: 15px" type="danger" round @click="confirmUpdate"  >确认</el-button>
                  <el-button type="danger" round  @click="isEditing = false">取消</el-button>
                </el-form-item>
              </el-form>
            </div>

          </div>

          <div style="margin-top: 15px; margin-left: 10px">
            <span style="font-weight: lighter; font-size: 18px">登录名称</span>
            <span style="margin-left: 25px; font-size: 18px">{{infoStore.info.username}}</span>
          </div>

          <div style="display: flex; align-items: center; margin-top: 15px; margin-left: 10px">
            <span style="font-weight: lighter; font-size: 18px">用户邮箱</span>
            <span style="margin-left: 25px; font-size: 18px" v-if="isEmail === false">{{infoStore.info.email}}
        <el-button style="margin-left: 10px" type="primary" link @click="emailEdit"><el-icon><Edit /></el-icon>编辑</el-button>
        </span>
            <!-- 使用v-if来控制输入框的显示与隐藏 -->
            <div  v-if="isEmail" style="margin-left: 20px; margin-top: 15px">
              <el-form :model="user" :rules="rules">
                <el-form-item prop="email">
                  <el-input
                      v-model="user.email"
                      style="width: 240px"
                      placeholder="Please input"
                  />
                  <el-button style="margin-left: 15px" type="danger" round @click="confirmUpdateE" >确认</el-button>
                  <el-button type="danger" round  @click="isEmail = false">取消</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <div style="margin-top: 15px; margin-left: 10px">
            <span style="font-weight: lighter; font-size: 18px">加入时间</span>
            <span style="margin-left: 25px; font-size: 18px">{{user.createTime}}</span>
          </div>

          <div style="margin-top: 15px; margin-left: 10px">
            <span style="font-weight: lighter; font-size: 18px">最近一次修改</span>
            <span style="margin-left: 25px; font-size: 18px">{{user.updateTime}}</span>
          </div>

        </div>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="second">
        <div style="margin-top: 20px">
          <el-form :model="pwdInfo" :rules="rulers" label-width="100px" size="large" >
            <el-form-item label="原密码">
              <el-input style="width: 300px" v-model="pwdInfo.oldPassword" ></el-input>
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input style="width: 300px" type="password" show-password v-model="pwdInfo.newPassword"></el-input>
            </el-form-item>

            <el-form-item label="确认密码" prop="rePassword">
              <el-input style="width: 300px" type="password" show-password v-model="pwdInfo.rePassword"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"  @click="updatePassword">提交修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane label="更换头像" name="third">
        <div style="margin: 40px auto; text-align: center; max-width: 400px;">
          <!-- 头像展示 -->
          <div class="avatar-container">
            <el-upload
                ref="uploadRef"
                :show-file-list="false"
                :auto-upload="true"
                action="/api/upload"
                name="file"
                :headers="{'Authorization': tokenStore.token}"
                :on-success="uploadSuccess"
            >
              <img v-if="imgUrl" :src="imgUrl" class="avatar-preview" />
              <img v-else :src="avatar" class="avatar-preview" />
            </el-upload>
          </div>

          <!-- 按钮组 -->
          <div style="margin-top: 20px;">
            <el-button
                type="primary"
                :icon="Plus"
                size="large"
                class="custom-button"
                @click="uploadRef.$el.querySelector('input').click()"
            >
              选择图片
            </el-button>
            <el-button
                type="success"
                :icon="Upload"
                size="large"
                class="custom-button"
                @click="updateAvatar"
            >
              上传头像
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<style scoped>



.background {
  background-image: url('../../../assets/background.jpg'); /* 替换为您的图片URL */
  background-size: cover; /* 确保背景图片覆盖整个元素，但可能会裁剪 */
  background-position: center; /* 将背景图片居中显示 */
  display: flex;
  justify-content: center;
  height: 150vh; /* 设置高度为视口高度的100% */
  margin: 0; /* 可选，确保没有外部边距影响布局 */
  padding: 0; /* 可选，确保没有内部填充影响布局 */

}

.is-selected {
  color: #1989fa;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}


/* 头像容器 */
.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border: 2px dashed #ccc;
  border-radius: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  border-color: #409eff;
  background-color: #f0f8ff;
}

/* 头像预览 */
.avatar-preview {
  width: 278px;
  height: 278px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

/* 自定义按钮样式 */
.custom-button {
  margin: 0 10px;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


</style>