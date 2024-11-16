<script setup>
import { CopyDocument } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/composables/clipboard'
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js';
const base64ToText = ref({});
const textToBase64 = ref({});
watch(() => base64ToText.value.b, (newVal) => {
    if (newVal) {
        try {
            base64ToText.value.t = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64ToText.value.b))
        } catch (e) {
            ElMessage.warning('请输入有效的base64编码')
            base64ToText.value.t = ''
        }
    } else {
        base64ToText.value.t = ''
    }
})
watch(() => textToBase64.value.t, (newVal) => {
    if (newVal) {
        textToBase64.value.b = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(textToBase64.value.t))
    } else {
        textToBase64.value.b = ''
    }
})
</script>
<template>
    <el-text class="mx-1">文本转base64</el-text>
    <el-input v-model="textToBase64.t" placeholder="文本内容" type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(textToBase64.t)" />
        </template>
    </el-input>
    <br>
    <br>
    <el-input v-model="textToBase64.b" readonly type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(textToBase64.b)" />
        </template>
    </el-input>
    <el-text class="mx-1">base64转文本</el-text>
    <el-input v-model="base64ToText.b" placeholder="请输入base64编码" type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(base64ToText.b)" />
        </template>
    </el-input>
    <br>
    <br>
    <el-input v-model="base64ToText.t" readonly type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(base64ToText.t)" />
        </template>
    </el-input>
</template>

<style scoped>
.mx-1 {
    display: block;
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>