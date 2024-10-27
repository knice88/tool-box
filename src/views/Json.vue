<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { copyToClipboard } from '@/composables/clipboard'

const jsonStr = ref('')
const clickFormat = (space) => {
    // 1、JSON.parse：把JSON字符串转换为JSON对象
    // 2、JSON.stringify：把JSON对象 转换为 有缩进的 JSON字符串格式
    let jsonObj;
    try {
        jsonObj = JSON.parse(jsonStr.value)
    } catch (error) {
        ElMessage.error('格式错误: ' + error.message)
        return
    }
    jsonStr.value = JSON.stringify(jsonObj, null, space)
}

</script>

<template>
    <div>
        <el-button type="primary" @click="clickFormat('\t')">格式化JSON</el-button>
        <el-button type="primary" @click="clickFormat('')">压缩</el-button>
        <el-button type="primary" @click="copyToClipboard(jsonStr)">复制</el-button>
        <br /><br />
        <el-input v-model="jsonStr" type="textarea" :autosize="{ minRows: 20, maxRows: 40 }" placeholder="请输入JSON字符串" />
    </div>
</template>
