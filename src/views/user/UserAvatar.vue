<script setup>
import { Plus, Upload } from '@element-plus/icons-vue'
import {ref} from 'vue'

import avatar from '@/assets/default.png'


import {userInfoStore} from '@/stores/userInfo.js'
import {useTokenStore} from '@/stores/token.js'
import {ElMessage} from "element-plus";
const infoStore = userInfoStore()
const tokenStore = useTokenStore()

//用户头像地址
const imgUrl= ref(infoStore.info.userPic)
const oldImgUrl= ref(infoStore.info.userPic)

//上传图片，点击上传图片后的回调函数
/*const uploadSuccess = (result) => {

  if (result.data == null){
    ElMessage.error("照片大小不得超过 1MB")
  }else {
    imgUrl.value = result.data;
  }

}*/

import {updateAvatarService} from '@/api/user.js'
const updateAvatar = async () => {
  const result = await updateAvatarService(imgUrl.value);
  ElMessage.success(result.message?result.message:'修改成功')
  //修改pinia中的数据
  infoStore.info.userPic = imgUrl.value;
  oldImgUrl.value = imgUrl.value;
  previewImageUrl.value = 'null';
  dialogVisible.value = false;

}

// 数据状态
const dialogVisible = ref(false);
const previewImageUrl = ref();
const uploadRef = ref()
const dialogUploadRef = ref(null);

const dialogImage = () => {
  dialogVisible.value = true;
  previewImageUrl.value = '';
}

const beforeUpload = (file) => {
  // 支持的图片格式
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const isAllowedType = allowedTypes.includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isAllowedType) {
    ElMessage.error('请上传 JPG、PNG 或 JPEG 格式的图片!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  // 更新预览图片
  return isAllowedType && isLt2M;
}

const uploadSuccess = (response, file, fileList) => {
  // 更新预览图片
  previewImageUrl.value = response.data;
  //console.log("zhe li " + previewImageUrl.value)
  imgUrl.value = response.data;

}

</script>

<template>
  <div>
    <!-- 头像上传组件 -->
    <img :src="oldImgUrl ? oldImgUrl : avatar" class="avatar" @click="dialogImage" />
    <!-- 弹出对话框 -->
    <el-dialog title="修改头像"  v-model="dialogVisible" width="50%">
      <div class="preview-container">
        <div class="avatar-wrapper preview-avatar">
          <span>当前头像</span>
          <el-upload
              ref="dialogUploadRef"
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="true"
              action="/api/upload"
              name="file"
              :headers="{'Authorization': tokenStore.token}"
              :on-success="uploadSuccess"
              :before-upload="beforeUpload"
          >
            <img :src="oldImgUrl ? oldImgUrl : avatar" class="avatar1"  @click.stop />
          </el-upload>
          <el-button style="margin-top: 10px" type="primary" :icon="Plus" size="default" @click="dialogUploadRef.$el.querySelector('input').click()">
            选择图片
          </el-button>
        </div>
        <div class="divider"></div>
        <div class="avatar-wrapper current-avatar">
          <span>预览头像</span>
          <el-image
              class="demo-image__preview"
              style="width: 150px; height: 150px ; border-radius: 50%"
              :src="previewImageUrl ? previewImageUrl : oldImgUrl"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[previewImageUrl ? previewImageUrl : oldImgUrl]"
              fit="cover"
          />
          <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateAvatar">确定</el-button>
          </span>
        </div>
      </div>
    </el-dialog>


  </div>

</template>

<style lang="scss" scoped>

.avatar {
  width: 150px; /* 设置头像的宽度 */
  height: 150px; /* 设置头像的高度 */
  border-radius: 50%; /* 圆形头像 */
  object-fit: cover; /* 确保图片填充整个区域 */
  border: 1px solid #d9d9d9; /* 添加边框 */
}

.avatar1 {
  width: 150px; /* 设置头像的宽度 */
  height: 150px; /* 设置头像的高度 */
  //border-radius: 50%; /* 圆形头像 */
  object-fit: cover; /* 确保图片填充整个区域 */
  //border: 2px solid #d9d9d9; /* 添加边框 */
}

.preview-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px; /* 底部间距 */
}

.avatar-wrapper {
  text-align: center; /* 居中显示文字和图片 */
}

.avatar-wrapper span {
  display: block;
  margin-bottom: 10px; /* 文字与图片之间的间距 */
  font-weight: bold;
}

.dialog-footer {
  text-align: center; /* 按钮居中 */
  margin-top: 20px; /* 顶部间距 */
}

.el-dialog__body {
  padding: 20px; /* 内边距 */
}


.demo-image__error .image-slot {
  font-size: 30px;
}
.demo-image__error .image-slot .el-icon {
  font-size: 30px;
}
.demo-image__error .el-image {
  width: 100%;
  height: 200px;
}



</style>