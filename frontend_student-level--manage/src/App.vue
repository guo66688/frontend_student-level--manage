<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- 判断是否是登录页面 -->
    <Layout v-if="!isLoginPage">
      <router-view />
    </Layout>
    <!-- 登录页面单独渲染 -->
    <router-view v-if="isLoginPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLoginPage = computed(() => route.name === 'Login')
</script>

<style>
/* 根节点撑满全屏 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
