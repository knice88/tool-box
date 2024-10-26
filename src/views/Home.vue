<script setup>
import Sidebar from './Sidebar.vue';
</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="150px">
                <Sidebar />
            </el-aside>
            <el-main width="calc(100% - 150px)">
                <RouterView />
            </el-main>
        </el-container>
    </div>
</template>
