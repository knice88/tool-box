<script setup>
import QRCode from 'qrcode'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
const inputText = ref('')
const generateCode = () => {
    QRCode.toDataURL(inputText.value)
        .then(url => {
            // 这是base64格式的图片数据，可以直接放到img标签的src属性中
            historyTexts.value.push({
                text: inputText.value,
                url: url,
                time: new Date().toLocaleString()
            })
            ElMessage.success('二维码已生成')
        })
        .catch(err => {
            ElMessage.error('二维码生成失败:'+ err.message)
        })
}
const historyTexts = ref([])
// 展示的时候按时间倒序排列
const reserveHistory = computed(() => {
    return historyTexts.value.slice().reverse()
})
</script>
<template>
    <el-input v-model="inputText" placeholder="请输入内容，输入框失去焦点则生成二维码" type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }" @change="generateCode" />
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <el-card style="max-width: 350px;" v-for="item in reserveHistory" :key="item.text">
            <template #header>{{ item.text }}</template>
            <img :src="item.url" style="width: 100%" />
            <template #footer><div style="color: gray; font-size: 15px;">{{ item.time }}</div></template>
        </el-card>
    </div>
</template>