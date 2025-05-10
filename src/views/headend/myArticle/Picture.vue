<script lang="ts" setup>
import { ref , onMounted} from 'vue'
import { Plus } from '@element-plus/icons-vue'

import {ElMessage, UploadProps, UploadUserFile} from 'element-plus'
import {addPictureService , findPicturesService , deletePictureByIdService} from '../../../api/article'

import {useTokenStore} from '../../../stores/token.js'
import {userInfoStore} from '../../../stores/userInfo'
import { useRoute , useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userId = ref(route.query.id)

const isShow = ref(false)
const tokenStore = useTokenStore();
const infoStore = userInfoStore();

const pictures = ref([
  {
    id: 1,
    nickname: '',
    userPicture: '',
  }
])

const fileList = ref<UploadUserFile[]>([
  {
    //createTime: '2024-7-26',
    uid: 1,
    url: 'null',
  },
])

//上传图片成功的回调函数
let uploadedPictures = [];


onMounted(() => {
  findPictures();
  show();
})

const show = () => {
  if (String(userId.value) === String(infoStore.info.id)){
    isShow.value = true;
  }else {
    isShow.value = false;
  }
}

const uploadSuccess = async (result) => {
  for (let i = 0; i < result.data.length; i++) {
    uploadedPictures.push(result.data[i])
    console.log("shangchuna " + uploadedPictures[i])
  }
}

const uploadOneSuccess = async (result) => {
  if (result.data == null){
    console.log("zheli " + result.data)
    ElMessage.error("上传文件大小不得超过2MB !")
  }else {
    const formData = new FormData();
    formData.append('userPicture' , result.data)
    const result1 = await addPictureService(formData);
    if (result1.code === 0){
      ElMessage.success("上传成功！")
    }
  }
}

//保存图片
const addUrl =  async () => {
  for (let i = 0; i < uploadedPictures.length; i++) {
    //console.log("asd " + uploadedPictures[i])
    const formData = new FormData();
    formData.append('userPicture' , uploadedPictures[i])
    await addPictureService(formData);
  }

  if (uploadedPictures.length > 0){
    ElMessage.success("成功添加")
  }else {
    ElMessage.warning("请选择文件后再提交！！")
  }
  // 清空 uploadedPictures 数组
  uploadedPictures = [];

  findPictures();
}

const findPictures = async () => {
  const result = await findPicturesService(userId.value);
  pictures.value = result.data
  // 首先，清空 fileList 中的数据
  fileList.value = [];
  for (let i = 0; i < result.data.length; i++) {
    const picture = result.data[i];
    fileList.value.push({
      url: picture.userPicture,
      uid: picture.id
    })
  }
}



const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove: UploadProps['onRemove'] = async (uploadFile, uploadFiles) => {
  //console.log( uploadFile,  uploadFiles)
  console.log(uploadFile.uid)
  const result = await deletePictureByIdService(uploadFile.uid);
  if (result.code === 0){
    ElMessage.success("删除成功 ！")
  }
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}
</script>

<template>
  <div v-if="isShow">
    <el-scrollbar height="550px">
      <el-upload
          v-model:file-list="fileList"
          :auto-upload="true"
          action="/api/upload1"
          list-type="picture-card"
          :headers="{'Authorization':tokenStore.token}"
          :on-success="uploadOneSuccess"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :accept="'.jpg, .jpeg, .png'"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </el-scrollbar>
  </div>


  <el-dialog v-model="dialogVisible" style="border-radius: 20px; background-color: #1a1a1a">
    <div style="margin-bottom: 20px">
      <a :href="dialogImageUrl" class="custom-link" >点击下载图片</a>
    </div>

    <div class="relative">
      <img
          w-full
          :src="dialogImageUrl"
          alt="Preview Image"
          class="object-fit-cover"
          style="height: 100%;"
      />
    </div>
  </el-dialog>

  <div v-if="isShow">
    <el-upload class="avatar-uploader" style="display: flex; justify-content: flex-end; align-items: center; margin-top: 20px"
               :auto-upload="true"
               :show-file-list="true"
               :multiple="true"
               action="/api/upload2"
               name="files"
               :headers="{'Authorization':tokenStore.token}"
               :on-success="uploadSuccess"
    >
      <template #trigger>
        <el-button type="primary">选择多个文件</el-button>
      </template>
      <el-button style="margin-left: 20px" @click="addUrl">提交</el-button>
    </el-upload>
  </div>

  <div v-if="fileList.length === 0">
    <el-empty description="没有数据" />
  </div>



</template>

<style scoped>
.object-fit-cover {
  object-fit: cover;
  width: 100%; /* 可选，因为已经通过Tailwind的w-full设置 */
  height: 100%; /* 根据需要设置 */
}

.custom-link {
  /* 去掉下划线 */
  text-decoration: none;
  /* 设置字体颜色为白色 */
  color: #ffffff; /* 白色 */
  /* 鼠标悬停时变为浅蓝色 */
  transition: color 0.3s ease; /* 平滑过渡效果 */
}

.custom-link:hover {
  color: #e6a23c; /* 浅蓝色 */
}
</style>