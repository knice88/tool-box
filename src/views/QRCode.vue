<script setup>
import QRCode from 'qrcode'
import { computed, ref, useTemplateRef } from 'vue'
import { copyToClipboard } from '@/composables/clipboard';
import jsQR from "jsqr"
import { ElMessage, dayjs } from 'element-plus'
import { DAY_FORMAT_SEC } from '@/composables/constant'

const inputText = ref('')
const generateCode = () => {
    QRCode.toDataURL(inputText.value)
        .then(url => {
            // 这是base64格式的图片数据，可以直接放到img标签的src属性中
            historyTexts.value.push({
                text: inputText.value,
                url: url,
                time: dayjs().format(DAY_FORMAT_SEC)
            })
            ElMessage.success('二维码已生成')
        })
        .catch(err => {
            ElMessage.error('二维码生成失败:' + err.message)
        })
}
const historyTexts = ref([])
// 展示的时候按时间倒序排列
const reserveHistory = computed(() => {
    return historyTexts.value.slice().reverse()
})
const mode = ref('0') // 0: 文本转二维码, 1: 二维码转文本
const fileRef = useTemplateRef('file-input') // 获取file输入框的引用
const qrcodeImgList = ref([])// 二维码图片列表, imgUrl: 图片链接, time: 生成时间, text: 二维码内容, fileName: 文件名
// 展示的时候按时间倒序排列
const reserveQrcodeImgList = computed(() => {
    return qrcodeImgList.value.slice().reverse()
})
const fileChange = async () => {
    const filePath = window.electronAPI.webUtils.getPathForFile(fileRef.value.files[0])
    const fileName = filePath.split(/[/\\]/).pop()
    const base64 = await imageToBase64(fileRef.value.files[0]);
    const img = new Image();
    img.src = base64
    img.onload = async () => {
        const code = await decodeQRCode(img)
        qrcodeImgList.value.push({
            imgUrl: base64,
            time: dayjs().format(DAY_FORMAT_SEC),
            text: code,
            fileName: fileName
        })
    };
}
const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
const decodeQRCode = async (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;

    ctx.drawImage(imageElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
        return code.data; // 返回解析的文本
    } else {
        return null;
    }
}
const handleDrop = (event) => {
    const files = event.dataTransfer.files;
    if (files.length) {
        fileRef.value.files = files;
        fileChange();
    }
};
</script>
<template>
    <div>
        <el-radio-group v-model="mode">
            <el-radio value="0">文本转二维码</el-radio>
            <el-radio value="1">二维码转文本</el-radio>
        </el-radio-group>
    </div>
    <br>
    <div v-if="mode === '0'">
        <el-input v-model="inputText" placeholder="请输入内容，输入框失去焦点则生成二维码" type="textarea"
            :autosize="{ minRows: 10, maxRows: 20 }" @change="generateCode" />
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <el-card style="max-width: 350px;" v-for="item in reserveHistory" :key="item.text">
                <template #header>{{ item.text }}</template>
                <img :src="item.url" style="width: 100%" />
                <template #footer>
                    <div style="color: gray; font-size: 15px;">{{ item.time }}</div>
                </template>
            </el-card>
        </div>
    </div>
    <div v-else>
        <div @dragover.prevent @drop.prevent="handleDrop"  @click="fileRef.click()"
            style="border: 2px dashed #ccc; padding: 100px; text-align: center; cursor: pointer;">
            将二维码图片拖到这里，或点击选择图片
            <input type="file" ref="file-input" :onchange="fileChange" style="display:none;" accept="image/*" />
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;" v-if="qrcodeImgList.length > 0">
            <!-- imgUrl: 图片链接, time: 生成时间, text: 二维码内容, fileName: 文件名 -->
            <el-card style="max-width: 350px;" v-for="item, index in reserveQrcodeImgList" :key="index">
                <template #header>
                    <div style="word-wrap: break-word;">{{ item.text?item.text: '二维码解析失败' }}</div>
                    <el-icon @click="copyToClipboard(item.text)" color="gray" v-if="item.text">
                        <DocumentCopy />
                    </el-icon>
                </template>
                <img :src="item.imgUrl" style="width: 100%" />
                <template #footer>
                    <div style="color: gray; font-size: 15px;line-height: 20px;">{{ item.time }}<br>{{ item.fileName }}
                    </div>
                </template>
            </el-card>
        </div>
    </div>
</template>