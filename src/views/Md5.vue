<script setup>
import { watch, ref } from 'vue'
import MD5 from "crypto-js/md5"
import { copyToClipboard } from '@/composables/clipboard'

const srcText = ref('')
const md5Lower = ref('')
const md5Upper = ref('')
watch(srcText, (newVal) => {
    md5Lower.value = newVal ? MD5(newVal).toString().toLowerCase() : ''
    md5Upper.value = newVal ? md5Lower.value.toUpperCase() : ''
})
</script>
<template>
    <div class="md5-result">
        <span>全小写的MD5值: </span>
        <el-input v-model="md5Lower" class="md5-output" readonly></el-input>
        <el-button type="primary" @click="copyToClipboard(md5Lower)"
            v-if="md5Lower">复制</el-button>
        <br>
        <span>全大写的MD5值: </span>
        <el-input v-model="md5Upper" class="md5-output" readonly></el-input>
        <el-button type="primary" @click="copyToClipboard(md5Upper)"
            v-if="md5Upper">复制</el-button>
    </div>
    <el-input v-model="srcText" type="textarea" :autosize="{ minRows: 10, maxRows: 30 }"
        placeholder="请输入需要加密的文本"></el-input>
</template>
<style scoped>
.md5-result {
    color: gray;
    line-height: 40px;
    margin-bottom: 40px;
}
.md5-output {
    width: 360px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>