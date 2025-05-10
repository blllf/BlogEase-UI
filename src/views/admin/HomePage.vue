<script setup>

</script>

<template>
  <div class="admin-home-page">
    <!-- 顶部标题区 -->
    <header class="page-header">
      <h1>个人创作与交流平台</h1>
      <p>一个专注于创作与分享的后端管理系统</p>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 简介区 -->
      <section class="section introduction">
        <h2>系统简介</h2>
        <p>本系统是一个基于Spring Boot 3和Vue 3开发的个人创作与交流平台，旨在为用户提供便捷的内容管理、文章发布和互动交流功能。</p>
      </section>

      <!-- 技术选型区 -->
      <section class="section tech-stack">
        <h2>技术选型</h2>
        <ul>
          <li><strong>后端：</strong>Spring Boot 3 + Mybatis-plus + Elasticsearch</li>
          <li><strong>前端：</strong>Vue 3 + Element Plus</li>
          <li><strong>数据库：</strong>MySQL + Redis</li>
          <li><strong>其他：</strong>JWT认证、Git版本控制、Echart</li>
        </ul>
      </section>

      <!-- 联系信息区 -->
      <section class="section contact-info">
        <h2>联系信息</h2>
        <p>如有任何问题或建议，请联系管理员：</p>
        <ul>
          <li><strong>Email：</strong>854234687@qq.com</li>
          <li><strong>电话：</strong>+86 1234567890</li>
        </ul>
      </section>

      <!-- 更新日志区 -->
      <section class="section update-log">
        <h2>更新日志</h2>
        <ul>
          <li><strong>v1.0.0 (2025-4-01)：</strong>初始版本发布，支持用户注册、登录和文章发布功能。</li>
          <li><strong>v1.1.0 (2025-5-01)：</strong>新增评论功能和用户权限管理。</li>
          <li><strong>v1.2.0 (2025-6-01)：</strong>优化性能，修复已知问题。</li>
        </ul>
      </section>


    </div>

  </div>
</template>




<style scoped>
.admin-home-page {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1500px; /* 增加最大宽度 */
  margin: 0 auto;
}

/* 顶部标题区 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
}
.page-header h1 {
  font-size: 30px;
  color: #333;
}
.page-header p {
  font-size: 16px;
  color: #666;
}

/* 主内容区 */
.main-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* 自动适应列宽 */
  gap: 20px; /* 列间距 */
}

/* 自定义每个模块的大小 */
.section {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  min-height: 200px; /* 最小高度 */
}

/* 简介区 */
.introduction {
  grid-column: span 1; /* 占据两列 */
}

/* 技术选型区 */
.tech-stack {
  grid-column: span 1; /* 占据一列 */
}

/* 更新日志区 */
.update-log {
  grid-column: span 2; /* 占据一列 */
}

/* 联系信息区 */
.contact-info {
  grid-column: span 1; /* 占据一列 */
}

/* 每个功能模块 */
.section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}
.section ul {
  list-style-type: disc;
  padding-left: 20px;
}
.section li {
  margin-bottom: 5px;
}

/* 更新日志样式 */
.update-log li strong {
  color: #409eff;
}

/* 联系信息样式 */
.contact-info ul {
  padding-left: 20px;
}
.contact-info li {
  margin-bottom: 5px;
}

/* 底部版权信息 */
.page-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
  color: #666;
}
</style>


