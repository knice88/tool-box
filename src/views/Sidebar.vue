<script setup>
const list = [
    {
        "route": "/json",
        "title": "json格式化"
    },
    {
        "route": "/md5",
        "title": "md5加密"
    }
]
</script>
<template>
    <el-menu class="el-menu-vertical" router>
        <el-menu-item v-for="item, index in list" :key="item.route" :index="index" :route="item.route"> {{item.title}} </el-menu-item>
    </el-menu>
</template>
