<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef, computed, watch } from 'vue';
import QRCode from 'qrcode'
import { ElMessage, dayjs } from 'element-plus'
import { DAY_FORMAT_SEC, DOWNLOAD_DIR_KEY } from '@/composables/constant'
import { copyToClipboard } from '@/composables/clipboard'

const serverInfo = ref({}) // 服务器信息
onMounted(async () => {
    await window.electronAPI.startHttpServer()
    getServerInfo()
})
const getServerInfo = () => {
    window.electronAPI.getServerInfo().then(info => {
        serverInfo.value.ip = info.ip
        serverInfo.value.port = info.port
        serverInfo.value.downloadDir = info.downloadDir
    })
}
onUnmounted(() => {
    window.electronAPI.stopHttpServer();
})

const selectDownloadDir = () => {
    window.electronAPI.selectFolder(serverInfo.value.downloadDir).then(dirs => {
        window.electronAPI.setSetting(DOWNLOAD_DIR_KEY, dirs[0])
        // 重新设置下载目录
        getServerInfo()
    })
}
const downloadFiles = ref([])
// 展示的时候按时间倒序排列
const reserveDownloadFiles = computed(() => {
    return downloadFiles.value.slice().reverse()
})
const fileRef = useTemplateRef('file-input') // 获取file输入框的引用
const formMsg = ref('')
let processList = ref([]) // 进度条对象，reqId=>进度条对象
window.electronAPI.onFormMsgUpdated((obj) => {
    // {"type": "text", "msg": "文本消息"}
    if (obj.type === 'text') {
        formMsg.value = obj.msg
    }
    if (obj.type === 'process') {
        // 进度条
        let index = processList.value.findIndex(item => item.reqId === obj.reqId)
        if (index === -1) {
            // 不存在则新增
            processList.value.push({
                reqId: obj.reqId,
                obj: obj,
            })
        } else {
            // 存在则更新
            processList.value[index].obj = obj
        }
        console.log(processList.value)
    }
})

function showSize(sizeByte) {
    if (sizeByte < 1024) {
        return sizeByte + 'B';
    } else if (sizeByte < 1024 * 1024) {
        return (sizeByte / 1024).toFixed(2) + 'KB';
    } else if (sizeByte < 1024 * 1024 * 1024) {
        return (sizeByte / 1024 / 1024).toFixed(2) + 'MB';
    }
    return (sizeByte / 1024 / 1024 / 1024).toFixed(2) + 'GB';
}

const fileChange = () => {
    const filePath = window.electronAPI.webUtils.getPathForFile(fileRef.value.files[0])
    const fileName = filePath.split(/[/\\]/).pop()
    window.electronAPI.createDownLink(filePath).then(key => {
        const link = `http://${serverInfo.value.ip}:${serverInfo.value.port}/send/${key}`
        QRCode.toDataURL(link).then(imgUrl => {
            downloadFiles.value.push({
                link: link,
                fileName: fileName,
                imgUrl: imgUrl,
                time: dayjs().format(DAY_FORMAT_SEC),
            })
        })
    }).catch(err => {
        ElMessage.error('链接生成失败:' + err.message)
    })
}
const recInfo = ref({
    url: '', // 链接地址
    imgUrl: '' // 二维码图片地址
})
watch(serverInfo, (newVal) => {
    if (newVal) {
        recInfo.value.url = `http://${newVal.ip}:${newVal.port}/recPage`
        QRCode.toDataURL(recInfo.value.url).then(imgUrl => {
            recInfo.value.imgUrl = imgUrl
        })
    }
}, { deep: true })
const transferMode = ref('0') // 发送/接收模式，0-发送，1-接收
const handleDrop = (event) => {
    const files = event.dataTransfer.files;
    if (files.length) {
        fileRef.value.files = files;
        fileChange();
    }
};
const format = (percentage) => (percentage === 100 ? 'completed' : `${percentage}%`)
</script>

<template>
    <!-- <el-input type="text" placeholder="内网ip地址" v-model="serverInfo.ip"></el-input> -->
    <div>
        <el-radio-group v-model="transferMode">
            <el-radio value="0">发送文件</el-radio>
            <el-radio value="1">接收文件</el-radio>
        </el-radio-group>
    </div>
    <div v-if="transferMode === '0'">
        <div @dragover.prevent @drop.prevent="handleDrop" @click="fileRef.click()"
            style="border: 2px dashed #ccc; padding: 100px; text-align: center; cursor: pointer;">
            将文件拖到这里，或点击选择文件
            <input type="file" ref="file-input" :onchange="fileChange" style="display:none;" />
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;" v-if="downloadFiles.length > 0">
            <el-card style="max-width: 320px; width: 100%;" v-for="item, index in reserveDownloadFiles" :key="index">
                <template #header>
                    <div style="word-wrap: break-word;">{{ item.link }}</div>
                </template>
                <img :src="item.imgUrl" style="width: 100%" />
                <template #footer>
                    <div style="color: gray; font-size: 15px;line-height: 20px;">{{ item.time }}<br>{{ item.fileName }}
                    </div>
                </template>
            </el-card>
        </div>
    </div>
    <div v-if="transferMode === '1'">
        <div style="padding: 20px">
            <el-text class="mx-1">扫描二维码可打开链接: {{ recInfo.url }}</el-text>
        </div>
        <el-card style="max-width: 320px; width: 100%;">
            <img :src="recInfo.imgUrl" style="width: 100%" />
            <template #footer>
                <div style="color: gray; font-size: 15px;">文件将保存到
                    <el-button link type="primary" @click.prevent="selectDownloadDir">
                        {{ serverInfo.downloadDir }}
                    </el-button>
                </div>
            </template>
        </el-card>
        <!-- 进度条 -->
        <br>
        <br>
        <div v-for="item in processList" :key="item.reqId">
            <el-progress :percentage="Math.ceil(item.obj.progress)" :format="format" />
            <el-text>文件总大小: {{ showSize(item.obj.totalSize) }}</el-text>
            <el-text>&nbsp;&nbsp;平均速度: {{ showSize(item.obj.speed) }}/s</el-text>
            <el-text v-if="item.obj.progress < 100">&nbsp;&nbsp;预计剩余时间: {{ item.obj.remainTime.toFixed(2) }}s</el-text>
            <br>
            <br>
        </div>
        <br>
        <el-button type="primary" @click="copyToClipboard(formMsg)" :disabled="!formMsg">复制消息</el-button>
        <el-input type="textarea" readonly v-model="formMsg" :autosize="{ minRows: 10, maxRows: 20 }"
            style="margin-top: 10px;"></el-input>
    </div>
</template>
