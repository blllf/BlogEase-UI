<script setup>
import {onMounted,onUnmounted, reactive, ref} from 'vue';
import '@wangeditor/editor/dist/css/style.css';
import { createEditor, createToolbar } from '@wangeditor/editor';
import {ElSelect, ElOption, ElUpload, ElNotification, ElMessage} from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import {useTokenStore} from '@/stores/token.js'
import {articleCategoryListService2} from '../../../api/article.js'
import {articleAddService} from '../../../api/article.js'
import {useRoute} from "vue-router";
import {readArticleService,updateArticleService} from '../../../api/article.js'


const route = useRoute()
const tokenStore = useTokenStore();
const editorElem = ref(null);
const editorToolbar = ref(null);
const editorInstance = ref(null);
const pageTitle = ref();  //标题
const editorContent = ref('');  //需要保存的文本内容
const selectedCategory = ref(''); // 用于保存选中的分类
const imageUrl = ref() //用于保存封面图片
const categoryId = ref('') //选择类别Id
let beforeUnloadListener = null; // 添加一个引用来存储事件监听器，以便在组件卸载时移除它
const articleId = ref(null) //url参数中id
const isButtonDisabled = ref(false)

onMounted(async () => {
  //编辑文本栏
  editorInstance.value = createEditor({
    selector: editorElem.value,
    config: {
      placeholder: '#创作文本#',
      scroll: false,
      onChange(editor) {
        editorContent.value = editor.getHtml();
        //console.log(editorContent.value);
      },
      // 添加图片上传配置
      MENU_CONF: {
        uploadImage: {
          server: '/api/upload',
          fieldName: 'file',
          maxFileSize: 2 * 1024 * 1024, // 图片大小限制为2MB
          allowedFileTypes: ['image/jpg', 'image/jpeg', 'image/png'], // 允许的图片类型
          headers: {  // 添加 headers 配置
            'Authorization': tokenStore.token
          },
          metaWithUrl: false,  // 重要！防止自动添加 URL 参数
          onBeforeUpload(file) {
            console.log('开始上传图片：', file);
          },
          customInsert(res, insertFn) {
            if (res.code === 0) {
              console.log("tupian :" + res.data)
              insertFn(res.data, '', '');
            } else {
              console.error('无效的服务器响应:', res.message);
            }
          }
        }
      }
    },
  });
  //编辑工具栏
  createToolbar({
    editor: editorInstance.value,
    selector: editorToolbar.value,
  });
  //获取所有分类
  await findAllCategories();
  //获取文章参数ID-编辑文章
  articleId.value = route.params.id;
  if (articleId.value) {
    const result = await readArticleService(articleId.value);
    if (result.code === 0){
      articleModel.value = result.data
      pageTitle.value = articleModel.value.title
      const selectedItem = categories.value.find(item => item.id === articleModel.value.categoryId);
      ruleForm.category = selectedItem.categoryName
      imageUrl.value = articleModel.value.coverImg
      if(editorInstance.value) {
        editorInstance.value.setHtml(articleModel.value.content); // 使用 setHtml 设置编辑器内容
      }
      if (articleModel.value.deleted === 1 || articleModel.value.deleted === 0)
        isButtonDisabled.value = true;
    }
  }
  // 定义 beforeunload 事件处理函数
  const handleBeforeUnload = (event) => {
    if (checkForUnsavedChanges()) { // 检查是否有未保存的更改
      // 标准化兼容性写法
      event.preventDefault();
      // 设置 returnValue 来确保弹出确认对话框
      event.returnValue = '您有未保存的内容，确定要离开吗？';
    }
  };
  // 将事件处理函数赋值给全局变量，以便之后可以移除它
  beforeUnloadListener = handleBeforeUnload;
  // 添加事件监听器
  window.addEventListener('beforeunload', beforeUnloadListener);

});

onUnmounted(() => {
  // 当组件被销毁时，移除事件监听器
  if(beforeUnloadListener){
    window.removeEventListener('beforeunload', beforeUnloadListener);
  }
});

// 这里实现你的逻辑来判断是否有未保存的更改
const checkForUnsavedChanges = () => {
  // 返回 true 如果有未保存的更改，否则返回 false
  return editorContent.value !== '' || articleModel.value.title !== '' || articleModel.value.categoryId !== '' || articleModel.value.coverImg !== '';
};

//查询所有种类
const findAllCategories = async () => {
    const result = await articleCategoryListService2();
    categories.value = result.data;
}


const uploadSuccess = (result) => {
  imageUrl.value = result.data
  console.log(result.data)
}

//添加表单数据模型
const articleModel = ref({
  title: '',
  categoryId: '',
  coverImg: '',
  content:'',
  state:''
})


const publishBlog = async (status) => {
  articleModel.value = {
    id: articleId.value,
    title: pageTitle.value,
    categoryId: categoryId.value,
    coverImg: imageUrl.value,
    content: editorContent.value,
    state: status
  }

  console.log('categoryId' , articleModel.value.categoryId)

  //本人已发布或保存草稿的文章处理逻辑
  if (articleId.value != null){
    const selectedItem = categories.value.find(item => item.categoryName === ruleForm.category);
    articleModel.value.categoryId = selectedItem.id
    if (status == '发布中'){
      //articleModel.value.state = '发布中';
      articleModel.value.deleted = 1;
    }else if (status == '草稿') {
      //articleModel.value.state = status;
      articleModel.value.deleted = 2;
    }
    const result = await updateArticleService(articleModel.value);
    ElMessage.success(result.message ? result.message : '修改成功')
  }else {
    const result = await articleAddService(articleModel.value);
    if (result.code === 0 && status === '发布中' && articleId.value == null) {
      ElNotification.success({title: 'Success',message: '发布成功，等待管理员审核'})
    } else if (status === '草稿') {
      ElNotification.info({title: 'Info',message: '已保存为草稿'})
    }
  }



};

const categories = ref([
  {
    id: 3,
    categoryName: '美食',
    categoryAlias: 'my',
    createTime: '2023-09-02 12:06:59',
    updateTime: '2023-09-02 12:06:59',
    categoryPic: '',
    createUser: ''
  },
])

// 表单引用
const ruleFormRef = ref(null);

// 初始化表单数据
const ruleForm = reactive({
  category: '',
});

// 验证规则
const rules = reactive({
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
});

// 添加 handleChange 方法用于调试
const handleChange = (value) => {
  console.log('Selected Category:', value);
  const selectedItem = categories.value.find(item => item.categoryName === value);
  console.log('selectedItem' , selectedItem)
  if (selectedItem) {
    categoryId.value = selectedItem.id
  } else {
    console.warn('未找到对应的分类项');
  }
};

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url;
  dialogVisible.value = true;
};


</script>

<template>
  <div style="border-bottom: 1px solid #e8e8e8;">
    <div ref="editorToolbar"></div>
  </div>

  <div class="content">
    <div class="editor-container">
      <div class="title-container">
        <input placeholder="请输入文章标题" v-model="pageTitle" />
        <hr/>
      </div>
      <div class="editor-text-area" ref="editorElem"></div>
    </div>

    <div class="editor-container">
      <div>
        <el-form
            ref="ruleFormRef"
            style="max-width: 300px;"
            :rules="rules"
            label-width="auto"
            :model="ruleForm"
            status-icon
        >
          <el-form-item label="文章分类" prop="category">
            <el-select v-model="ruleForm.category" placeholder="请选择分类" clearable @change="handleChange">
              <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.categoryName"
                  :value="item.categoryName"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="文章封面">
            <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false"
                       action="/api/upload"
                       name="file"
                       :headers="{'Authorization':tokenStore.token}"
                       :on-success="uploadSuccess">
              <div class="image-container" v-if="imageUrl">
                <img :src="imageUrl" class="avatar"/>
                <div class="overlay">
                  <el-button type="primary" size="small" @click.stop="handlePictureCardPreview({ url: imageUrl })">预览</el-button>
                </div>
              </div>
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogVisible" width="50%">
      <img :src="dialogImageUrl" alt="Preview Image" style="width: 100%;">
    </el-dialog>

  </div>



  <!-- 固定在屏幕底部的导航条 -->
  <div class="page-bottom">
    <button class="action-button" @click="publishBlog('草稿')">保存草稿</button>
    <button class="action-button publish-button" @click="publishBlog('发布中')">发布博客</button>
  </div>
  <div class="page-bottom" v-if="articleId">
    <button class="action-button" @click="publishBlog('草稿')">保存为草稿</button>
    <button class="action-button publish-button" :disabled="isButtonDisabled" @click="publishBlog('发布中')">发布博客</button>
  </div>
</template>

<style scoped>
/* 基础样式 */
html,
body {
  background-color: #f5f5f5;
  height: 100%;
  overflow: hidden;
  color: #333;
  margin: 0;
}

.content {
  height: calc(100% - 100px); /* 调整以适应底部导航条的高度 */
  background-color: rgb(245, 245, 245);
  overflow-y: auto;
  position: relative;
}

.editor-container {
  width: 100%;
  max-width: 850px;
  margin: 30px auto;
  background-color: #fff;
  padding: 20px 50px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.editor-text-area {
  min-height: 600px; /* 减少高度以便更多空间用于其他内容 */
  margin-top: 20px;
}

.title-container input {
  font-size: 30px;
  border: 0;
  outline: none;
  width: 100%;
  line-height: 1;
}

.image-container {
  position: relative;
  width: 150px; /* 固定宽度 */
  height: 150px; /* 固定高度 */
}

.avatar {
  width: 100%; /* 图片宽度占满容器 */
  height: 100%; /* 图片高度占满容器 */
  object-fit: cover; /* 确保图片按比例缩放并填满整个区域，可能会裁剪 */
}

/* 覆盖层样式 */
.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  transition: .5s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container:hover .overlay {
  opacity: 1;
}



/* 底部导航条样式 */
.page-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 10px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.12);
  text-align: right;
}

.action-button {
  padding: 10px 20px;
  margin-left: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

/* 鼠标悬停时的效果 */
.action-button:hover {
  background-color: #8c939d;
}

/* 发布按钮特有样式 */
.action-button.publish-button {
  margin-right: 200px;
  background-color: #409eff;
  color: white;
}

/* 鼠标悬停在发布按钮上的效果 */
.action-button.publish-button:hover {
  background-color: #367bd4;
}

/* 禁用状态下的发布按钮样式 */
.action-button.publish-button:disabled,
.action-button.publish-button:hover:disabled {
  background-color: #a0cfff; /* 更浅的颜色 */
  color: #000000; /* 更浅的文字颜色 */
  cursor: not-allowed; /* 改变鼠标指针为禁止图标 */
  opacity: 0.85; /* 添加透明度使按钮看起来被禁用 */
}









</style>
