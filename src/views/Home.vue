<script setup>
import Sidebar from './Sidebar.vue';
</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="200px">
                <Sidebar />
            </el-aside>
            <el-main>
                <RouterView />
            </el-main>
        </el-container>
    </div>
</template>
