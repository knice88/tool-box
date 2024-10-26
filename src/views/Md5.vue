<script setup>
import { watch, ref } from 'vue'
import MD5 from "crypto-js/md5"
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'

const srcText = ref('')
const md5Text = ref('')
const { text, copy, copied, isSupported } = useClipboard({ md5Text })
watch(srcText, (newVal) => {
    md5Text.value = newVal ? MD5(newVal).toString() : ''
})
const clickCopy = (str) => {
    copy(str)
    if (copied) {
        ElMessage.success('复制成功')
    } else {
        ElMessage.error('复制失败')
    }
}

</script>
<template>
    <el-input v-model="srcText" type="textarea" class="source-text" :autosize="{ minRows: 5 }"
        placeholder="请输入需要加密的文本"></el-input>
    <div>
        <span class="alarm-title">全小写的MD5值: </span>{{ md5Text.toLowerCase() }}
        <el-button type="primary" @click="clickCopy(md5Text.toLowerCase())" v-if="md5Text.length > 0">复制</el-button>
    </div>
    <div>
        <span class="alarm-title">全大写的MD5值: </span>{{ md5Text.toUpperCase() }}
        <el-button type="primary" @click="clickCopy(md5Text.toUpperCase())" v-if="md5Text.length > 0">复制</el-button>
    </div>
</template>
<style scoped>
.source-text {
    height: 200px;
}

.alarm-title {
    color: gray;
    line-height: 36px;
}
</style>