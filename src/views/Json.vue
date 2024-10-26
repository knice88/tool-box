<script setup>
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
const jsonStr = ref('')
const { text, copy, copied, isSupported } = useClipboard({ jsonStr })
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

const clickCopy = () => {
    copy(jsonStr.value)
    if (copied) {
        ElMessage.success('复制成功')
    } else {
        ElMessage.error('复制失败')
    }
}
</script>

<template>
    <div>
        <el-button type="primary" @click="clickFormat('\t')">格式化JSON</el-button>
        <el-button type="primary" @click="clickFormat('')">压缩</el-button>
        <el-button type="primary" @click="clickCopy">复制</el-button>
        <br /><br />
        <el-input v-model="jsonStr" type="textarea" :autosize="{ minRows: 20, maxRows: 40 }" placeholder="请输入JSON字符串" />
    </div>
</template>
