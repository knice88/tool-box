<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, computed, useTemplateRef, onMounted } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()
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
    },
    {
        "route": "/fileTransfer",
        "title": "传输文件"
    }
]
const searchWords = ref('')
const displayMenus = computed(() => {
    return list.filter(item => item.title.toLowerCase().includes(searchWords.value.toLowerCase()))
})
const searchEle = useTemplateRef('search')
onMounted(() => {
    // 打开页面时，搜索框自动获得焦点
    searchEle.value.focus()
})
const openFirstMenu = () => {
    if (displayMenus.value.length > 0) {
        const firstMenu = displayMenus.value[0].route
        router.push(firstMenu)
    }
}
</script>
<template>
    <el-menu class="el-menu-vertical" router>
        <el-input placeholder="搜索菜单" style="width: 90%;margin-right: 5px;margin-bottom: 10px;" :suffix-icon="Search" clearable
            v-model="searchWords" ref="search" @keyup.enter="openFirstMenu" />
        <el-menu-item v-for="item in displayMenus" :key="item.route" :index="item.route" :route="item.route"> {{
            item.title }}
        </el-menu-item>
    </el-menu>
</template>
