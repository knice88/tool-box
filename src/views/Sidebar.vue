<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, computed } from 'vue';
const list = [
    {
        "route": "/json",
        "title": "json格式化"
    },
    {
        "route": "/md5",
        "title": "md5加密"
    },
    {
        "route": "/aes",
        "title": "aes加密"
    },
    {
        "route": "/httpClient",
        "title": "http客户端"
    },
    {
        "route": "/wsClient",
        "title": "ws客户端"
    },
    {
        "route": "/time",
        "title": "时间戳工具"
    },
    {
        "route": "/qrcode",
        "title": "二维码工具"
    }
]
const searchWords = ref('')
const displayMenus = computed(() => {
    console.log(searchWords.value)
    return list.filter(item => item.title.toLowerCase().includes(searchWords.value.toLowerCase()))
})
</script>
<template>
    <el-menu class="el-menu-vertical" router>
        <el-input placeholder="搜索菜单" style="width: 90%;margin-right: 5px;" :suffix-icon="Search" clearable
            v-model="searchWords"></el-input>
        <el-menu-item v-for="item in displayMenus" :key="item.route" :index="item.route" :route="item.route"> {{
            item.title }}
        </el-menu-item>
    </el-menu>
</template>
