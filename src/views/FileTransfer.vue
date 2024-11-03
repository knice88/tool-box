<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef, computed, watch } from 'vue';
import QRCode from 'qrcode'
import { ElMessage, dayjs } from 'element-plus'
import { DAY_FORMAT_SEC } from '@/composables/constant'

const serverInfo = ref({}) // 服务器信息
onMounted(async () => {
    await window.electronAPI.startHttpServer()
    window.electronAPI.getServerInfo().then(info => {
        serverInfo.value.ip = info.ip
        serverInfo.value.port = info.port
        serverInfo.value.downloadDir = info.downloadDir
    })
})
onUnmounted(() => {
    window.electronAPI.stopHttpServer();
})
const downloadFiles = ref([])
// 展示的时候按时间倒序排列
const reserveDownloadFiles = computed(() => {
    return downloadFiles.value.slice().reverse()
})
const fileChange = () => {
    const filePath = window.electronAPI.webUtils.getPathForFile(fileRef.value.input.files[0])
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
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
const fileModel = ref('') // 在输入框为file类型时，v-model绑定的值为假的文件路径，没什么用
const fileRef = useTemplateRef('file-input') // 获取file输入框的引用
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
        <el-input placeholder="请输入要发送的文件路径" type="file" v-model="fileModel" ref="file-input" @input="fileChange"
            style="margin-top: 10px;"></el-input>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;" v-if="downloadFiles.length > 0">
            <el-card style="max-width: 320px; width: 100%;" v-for="item, index in reserveDownloadFiles" :key="index">
                <template #header>
                    {{ item.link }}
                </template>
                <img :src="item.imgUrl" style="width: 100%" />
                <template #footer>
                    <div style="color: gray; font-size: 15px;">{{ item.time }}&nbsp;&nbsp;&nbsp;{{ item.fileName }}
                    </div>
                </template>
            </el-card>
        </div>
    </div>
    <div v-if="transferMode === '1'">
        <el-card style="max-width: 320px; width: 100%;">
            <template #header>扫描二维码上传文件，文件将保存到{{ serverInfo.downloadDir }}</template>
            <img :src="recInfo.imgUrl" style="width: 100%" />
        </el-card>
    </div>
</template>
