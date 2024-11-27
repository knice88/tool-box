<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, computed, useTemplateRef, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { LAST_OPEN } from '@/composables/constant'

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
    },
    {
        "route": "/hex",
        "title": "十六进制"
    },
    {
        "route": "/base64",
        "title": "Base64"
    },
    {
        "route": "/guid",
        "title": "GUID 生成器"
    }
]
const searchWords = ref('')
const displayMenus = computed(() => {
    return list.filter(item => item.title.toLowerCase().includes(searchWords.value.toLowerCase()))
})
const searchEle = useTemplateRef('search')
const activedRoute = ref('') // 记录当前打开的路由
onMounted(() => {
    // 打开页面时，搜索框自动获得焦点
    searchEle.value.focus()
    // 打开页面时，自动跳转到上次打开的页面
    window.electronAPI.getSetting(LAST_OPEN).then(lastOpenRoute => {
        if (lastOpenRoute) {
            router.push(lastOpenRoute)
            activedRoute.value = lastOpenRoute
        }
    })
})
const openFirstMenu = () => {
    if (displayMenus.value.length > 0) {
        const firstMenu = displayMenus.value[0].route
        router.push(firstMenu)
        window.electronAPI.setSetting(LAST_OPEN, firstMenu)
        activedRoute.value = firstMenu
    }
}
const cliMenuItem = (item) => {
    window.electronAPI.setSetting(LAST_OPEN, item.index)
    activedRoute.value = item.index
}
</script>
<template>
    <el-menu class="el-menu-vertical" router>
        <el-input placeholder="搜索菜单" style="width: 90%;margin-right: 5px;margin-bottom: 10px;" :suffix-icon="Search"
            clearable v-model="searchWords" ref="search" @keyup.enter="openFirstMenu" />
        <el-menu-item v-for="item in displayMenus" :key="item.route" :index="item.route" :route="item.route" :class="{'is-active': activedRoute === item.route}"
            @click="cliMenuItem">
            {{ item.title }}
        </el-menu-item>
    </el-menu>
</template>
