<script setup>
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
</script>
<template>
    <el-menu class="el-menu-vertical" router>
        <el-menu-item v-for="item in list" :key="item.route" :index="item.route" :route="item.route"> {{ item.title }}
        </el-menu-item>
    </el-menu>
</template>
