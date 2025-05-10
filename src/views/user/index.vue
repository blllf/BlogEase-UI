<script setup>
import { ref } from 'vue'
import {userInfoStore} from '@/stores/userInfo.js'
import UserInfo from '../../views/user/UserInfo.vue'
import UserResetPassword from '../../views/user/UserResetPassword.vue'
import UserAvatar from '../../views/user/UserAvatar.vue'

const infoStore = userInfoStore();

const userInfo = ref({
  id: infoStore.info.id,
  username: infoStore.info.username,
  nickname: infoStore.info.nickname,
  email: infoStore.info.email,
  userPic: infoStore.info.userPic,
  createTime: infoStore.info.createTime
})

const activeTab = ref("userinfo");

</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <UserAvatar />
            </div>

            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                用户名称
                <div class="pull-right">{{userInfo.username}}</div>
              </li>
              <li class="list-group-item">
                手机号码
                <div class="pull-right">123456789</div>
              </li>
              <li class="list-group-item">
               用户邮箱
                <div class="pull-right">{{userInfo.email}}</div>
              </li>
              <li class="list-group-item">
               创建日期
                <div class="pull-right">{{userInfo.createTime}}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <UserInfo></UserInfo>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <UserResetPassword/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>

</template>

<style scoped>

.text-center {
  text-align: center;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}

.pull-right {
  float: right !important;
}

.el-card__header {
  padding: 14px 15px 7px !important;
  min-height: 40px;
}

.el-card__body {
  padding: 15px 20px 20px 20px !important;
}

.card-box {
  padding-right: 15px;
  padding-left: 15px;
  margin-bottom: 10px;
}

</style>