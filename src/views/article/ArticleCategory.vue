<script lang="ts" setup>

import {
  Delete,
  Edit, Plus,
} from '@element-plus/icons-vue'
//调用接口添加表单
import {ElMessage} from 'element-plus'
import {onMounted,reactive,ref} from 'vue'
import {findCAndUAndAService,selectArticleByCategoryService , deleteCategoryService,updateCategoryService,addCategoryService,articleCategoryListService,articleCategoryListService2}
  from '../../api/article'
import {findUAService,findRankService} from '../../api/user'
/*import echarts from '../../echarts'*/
import * as echarts from 'echarts';
import avatar from '@/assets/default.png'
import {useTokenStore} from '@/stores/token.js'

const tokenStore = useTokenStore()





const dialogFormVisible = ref(false)
const form = ref({
  categoryName:'',
  categoryAlias:'',
  categoryPic: ''
})
const rules = {
  categoryName:[
    {required: true , message: '请输入分类名称' , triggr: 'blur'}
  ],
  categoryAlias:[
    {required: true , message: '请输入分类别名' , triggr: 'blur'}
  ],
  categoryPic:[
    {required: true , message: '格式400 * 400' , triggr: 'blur'}
  ]
}


const tableData = ref([
  {
    id:'',
    categoryName:'',
    categoryAlias: '',
    categoryPic: '',
    totalCount: '',
  }
])

//数据统计卡片你
const tableData2 = ref(
  {
    userCount:'',
    articleCount:'',
    categoryCount: '',
    accountDay: '',
  }
)

//树状
const tableData3 = ref([
  {
    username:'',
    totalCount: '', //文章数量
  }
])

//rank
const startTime = ref('2024-05-02')
const endTime = ref('2024-07-31')
const thumpUpData = ref([
  {
    username:'',
    totalCount: '', //点赞数量
  }
])



const initialData = ref([
  "星期一",
  "星期二",
])

const initDataCount = ref([
])

const threeData = ref([
  {
    value: 1000,
    name: 'a'
  },
])

const showCard = ref(false)



const selectArticleByCategory = async () => {

  const result = await selectArticleByCategoryService();
  tableData.value = result.data;
  const result2 = await findCAndUAndAService();
  tableData2.value = result2.data;
  const result3 = await findUAService();
  tableData3.value = result3.data;
  const result4 = await findRankService();
  thumpUpData.value = result4.data;

  console.log("longfei :" +  tableData3.value[1].username)

  initialData.value = result3.data.map(function (item) {
    return item.username;
  })

  initDataCount.value = result3.data.map(function (item) {
    return item.totalCount;
  })

  threeData.value = result.data.map(function (item) {
    return {
      value: item.totalCount,
      name: item.categoryName
    }
  })

}




onMounted(() => {
  initReservation();
  initThreeData();
});



const addCategory = async () => {
  try {
    // 设置标志
    instance.defaults.headers.common['category_add'] = 'true';
    // 调用服务添加分类
    const result = await addCategoryService(form.value);
    // 删除标志
    delete instance.defaults.headers.common['category_add'];
    // 显示成功消息
    ElMessage.success(result.message ? result.message : '添加成功');
    // 刷新文章列表
    selectArticleByCategory();
    // 关闭对话框
    dialogFormVisible.value = false;
  } catch (error) {
    // 处理错误
    ElMessage.error( '添加失败，数据不能为空');
    // 删除标志
    delete instance.defaults.headers.common['category_add'];
  }
}

//定义一个变量控制title的变化
const title = ref('')

//展示编辑弹窗
const showDialog = (row)=>{
  dialogFormVisible.value = true
  title.value='修改分类'
  form.value.categoryName = row.categoryName
  form.value.categoryAlias = row.categoryAlias
  form.value.categoryPic = row.categoryPic
  //扩展id属性
  form.value.id = row.id;
  //console.log(form.value.id);
}
//修改分类
const updateCategory = async ()=>{
  if (form.value.categoryName == null || form.value.categoryName.trim() === '' ||
      form.value.categoryAlias == null || form.value.categoryAlias.trim() === '' ||
      form.value.categoryPic == null || form.value.categoryPic.trim() === ''){
    ElMessage.warning('添加失败，数据不能为空')
  }else {
    const result = await updateCategoryService(form.value);
    ElMessage.success(result.message ? result.message : '修改成功')
    selectArticleByCategory();
    dialogFormVisible.value = false;
  }
}

//添加分类清空模型数据
const clearAddCategory = () => {
  dialogFormVisible.value = true; title.value='添加分类'
  form.value = {
    categoryName: '',
    categoryAlias: ''
  }
}

//删除分类对话框
import {ElMessageBox} from 'element-plus'
const deleteCategory = (row)  => {
  ElMessageBox.confirm(
      '你确认要删除该分类信息吗',
      '温馨提示',
      {
        confirmButtonText : '确认',
        cancelButtonText : '取消',
        type:'warning'
      }
  )
      .then(async () => {
        //调用删除接口
        const deleteCategory = await deleteCategoryService(row.id);
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
        selectArticleByCategory();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '用户取消了删除',
        })
      })
}

// ----------------------------------------------------------------------------
const uploadSuccess = (result) => {
  //alert("成功！")
  form.value.categoryPic = result.data
}

// ----------------------------------------------------------------------------

const switchColor = ref(false);
//矩形统计
const initReservation = async () => {
  await selectArticleByCategory();
  console.log("hhahhahh:  " + initialData.value + initialData.value.length)
  let myChart = echarts.init(document.getElementById("reservation"));
  const option = {
    xAxis: {
      type: "category",
      data: initialData.value,
      axisLabel: {
        interval: 0  // 设置为0表示强制显示所有标签
      }
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: initDataCount.value,
        type: "bar",
      },
    ],
  };

  myChart.setOption(option)
  window.addEventListener("resize", () => {
    myChart.resize();
  });

  if (switchColor.value) {
    myChart.dispose();
    //黑色模式
    myChart = echarts.init(document.getElementById("reservation"), "dark");
    myChart.setOption(option);
    //随着屏幕大小调节图表
    window.addEventListener("resize", () => {
      myChart.resize();
    });
  } else {
    myChart.dispose();
    //白色模式
    myChart = echarts.init(document.getElementById("reservation"));
    myChart.setOption(option);
    //随着屏幕大小调节图表
    window.addEventListener("resize", () => {
      myChart.resize();
    });
  }
}

//initReservation();

//扇形统计
const initThreeData = async() => {

  await selectArticleByCategory();

  //console.log("aaaa + " + threeData.value[1].value)

  let myChart = echarts.init(document.getElementById("threeData"));
  const option = {
    title: {
      text: "实时数据",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "站内篇幅",
        type: "pie",
        radius: "70%",
        data: threeData.value ,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  myChart.setOption(option)
  window.addEventListener("resize", () => {
    myChart.resize();
  });
  if (switchColor.value) {
    myChart.dispose();
    myChart = echarts.init(document.getElementById("threeData"), "dark");
    myChart.setOption(option);
    //随着屏幕大小调节图表
    window.addEventListener("resize", () => {
      myChart.resize();
    });
  } else {
    myChart.dispose();
    myChart = echarts.init(document.getElementById("threeData"));
    myChart.setOption(option);
    //随着屏幕大小调节图表
    window.addEventListener("resize", () => {
      myChart.resize();
    });
  }
}

//initThreeData();

const showCardFuction = () => {
  showCard.value = !showCard.value
  if (showCard.value === false){
    initReservation();
    initThreeData();
  }
}

//动态切换背景颜色
const handleSwitchChange = (value) => {
  initReservation();
  initThreeData();
}


</script>

<template>

  <el-card class="box-card" v-if="showCard === true">
    <div class="card-header">
      <span>文章分类</span>
      <el-button type="primary"  @click="clearAddCategory">添加分类</el-button>
    </div>
    <div style="margin-top: 20px">
      <hr>
    </div>

    <el-table :data="tableData" highlight-current-row style="width: 100%">
      <el-table-column label="序号" type="index" width="100" />
      <el-table-column label="图片" align="center" width="100">
        <template #default="{ row }">
          <img :src="row.categoryPic" alt="Category Picture" style="width: 50px; height: 50px;">
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" align="center" label="分类名称" width="180" />
      <el-table-column prop="categoryAlias" align="center" label="分类别名"  />
      <el-table-column prop="totalCount" align="center" label="全网帖子数量/篇"  />
      <el-table-column label="操作" align="center" width="100">
        <template #default="{ row }">
          <el-button type="primary" :icon="Edit" circle @click="showDialog(row)" />
          <el-button type="danger" :icon="Delete" circle @click="deleteCategory(row)" />
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据"></el-empty>
      </template>
    </el-table>
    <el-button type="warning"  style="margin-top: 20px" @click="showCardFuction">跳转至图形界面</el-button>

    <!-- 对话框   -->
    <el-dialog v-model="dialogFormVisible" :title=title width="500px">
      <el-form :model="form" style="padding-right: 30px" label-width="100px" :rules="rules">
        <el-form-item label="分类名称" prop="categoryName" >
          <el-input v-model="form.categoryName" autocomplete="off" minlength="1" maxlength="15" />
        </el-form-item>
        <el-form-item label="分类别名" prop="categoryAlias" >
          <el-input v-model="form.categoryAlias" autocomplete="off" minlength="1" maxlength="40" />
        </el-form-item>

        <el-form-item label="类别封面" prop="categoryPic">
          <el-alert
              type="info"
              description="建议图片尺寸为 510x440 像素"
              style="margin-bottom: 10px; width: 300px; height: 30px;"
              :closable="false"
          ></el-alert>
          <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false"
                     action="/api/uploadCategoryPic"
                     name="file"
                     :headers="{'Authorization':tokenStore.token}"
                     :on-success="uploadSuccess"
          >
            <img v-if="form.categoryPic" :src="form.categoryPic" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="title=='添加分类' ? addCategory() : updateCategory()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>


  </el-card>
  <div v-if="showCard === false ">
    <div>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="box home-user-task-stats bgc1">
                <div class="header">
                  <div style="font-weight: bold; margin-bottom: 10px">
                    数据统计
                  </div>
                </div>
                <div class="body">
                  <div class="stats">
                    <div class="item">
                      <div class="num color1 text-shadow1">
                        {{tableData2.userCount}}
                      </div>
                      <div class="text color2">总注册人数（个）</div>
                    </div>
                  </div>
                  <div class="stats">
                    <div class="item">
                      <div class="num color1 text-shadow1">
                        {{tableData2.articleCount}}
                      </div>
                      <div class="text color2">总文章数（篇）</div>
                    </div>
                  </div>
                  <div class="stats">
                    <div class="item">
                      <div class="num color1 text-shadow1">
                        {{tableData2.categoryCount}}
                      </div>
                      <div class="text color2">总类别数（个）</div>
                    </div>
                  </div>
                  <div class="stats">
                    <div class="item">
                      <div class="num color1 text-shadow1">
                        {{tableData2.accountDay}}
                      </div>
                      <div class="text color2">注册天数（天）</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card style="border-radius: 20px">
            <div style="width: 100%; height: 40px; display: flex; justify-content: center">
              <el-switch v-model="switchColor" active-text="Open" inactive-text="深色模式 : Close" @change="handleSwitchChange" />
            </div>
            <div>
              <div style="font-size: 18px; color: #000000; margin-bottom: 5px">
                文章发布量Top10用户
              </div>
              <div>
                <div id="reservation" style="width: 1000px; height: 350px"></div>
              </div>
            </div>
          </el-card>
          <el-card style="border-radius: 20px; margin-top: 10px">
            <div style="width: 100%; height: 40px; display: flex; justify-content: center">
              <el-button type="warning" text style="margin-left: 80px" @click="showCardFuction">编辑数据</el-button>
            </div>

            <div>
              <div
                  style="display: flex;justify-content: flex-start;font-size: 18px;color: #000000;margin-bottom: 20px;">
                类别统计
              </div>
              <div id="threeData" style="width: 1000px; height: 450px ; margin-left: 20px "></div>
            </div>
          </el-card>

        </el-col>

        <el-col :span="6" class="fixed-column">
            <el-card style="border-radius: 20px">
              <div class="box bgc3 sku-sale-rank">
                <div class="header">
                  <div style="font-weight: bold; margin-bottom: 10px">
                    作者热榜<span style="font-weight: normal;font-size: 13px;margin-left: 10px">
                    {{ startTime }} ~ {{ endTime }}</span>
                  </div>
                </div>
                <div class="body">
                  <el-row v-for="(item, index) in thumpUpData" :key="index">
                    <el-col :span="5">
                      <div :class="'top top' + (index + 1)">
                        {{ index + 1 }}
                      </div>
                    </el-col>
                    <el-col :span="13">
                      <div class="sku-name" :title="item.skuName">
                        {{ item.username }}
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="count">{{ item.totalCount }}👍</div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-card>
        </el-col>



      </el-row>

    </div>

  </div>





</template>




<style scoped>
/*固定卡片*/
.fixed-column {
  position: fixed;
  right: 30px;
}
.card-header{
  display: flex;
  justify-content: space-between;
}

.sku-sale-rank {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.6);
  width: 300px;
  min-height: 538px;
  background: #FFFFFF;
  border-radius: 20px;

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 15px;

    .top {
      display: inline-block;
      width: 16px;
      height: 20px;
      margin-left: 10px;
      background: url('@/assets/user-task-stats/top.png');
      text-align: center;
      font-size: 12px;
      font-weight: normal;
      color: #E9B499;
      line-height: 14px;
    }

    .top1 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top1.png');
      color: #8E5900;
    }

    .top2 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top2.png');
      color: #494949;
    }

    .top3 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top3.png');
      color: #CF6D3D;
    }

    .sku-name {
      height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: $--color-text-primary;
      line-height: 25px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .count {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #737589;
      line-height: 20px;
      text-align: right;
    }
  }
}


.home-user-task-stats {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.2);
  min-height: 166px;
  background: #E9F3FF;
  border-radius: 20px;
  margin-bottom: 20px;

  .body {
    flex: 1;
    display: flex;

    .stats {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .item {
        .num {
          height: 50px;
          font-size: 36px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          line-height: 50px;
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
        }

        .text {
          height: 17px;
          margin-top: 3px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #91a7dc;
          line-height: 17px;
        }

        .color1 {
          color: #072074;
        }

        .color2 {
          color: #91a7dc;
        }

        .color3 {
          color: #ff5757;
        }

        .color4 {
          color: #de9690;
        }

        .text-shadow1 {
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
        }

        .text-shadow2 {
          text-shadow: 2px 4px 7px rgba(255, 99, 85, 0.5);
        }
      }
    }
  }
}

.bgc1 {
  background: #E9F3FF;
  background-image: url('@/assets/images/circle.png'), url('@/assets/images/task.png');
  background-repeat: no-repeat, no-repeat;
  background-position: 0 0, calc(100% - 12px) 100%;

}

.bgc2 {
  background: #FBEFE8 url('@/assets/images/sale.png') no-repeat calc(100% - 12px) 100%;
}


</style>