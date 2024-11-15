<script setup>
import { CopyDocument } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/composables/clipboard'
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js';

const hexToDec = ref({})
watch(() => hexToDec.value.h, (newVal, oldVal) => {
    if (newVal) {
        try {
            hexToDec.value.d = BigInt("0x" + hexToDec.value.h).toString(10)
        } catch (e) {
            // 找出新的字符串中第一个不是十六进制的位置
            let illegalStr = newVal
            for (let i = 0; i < newVal.length; i++) {
                const c = newVal.charAt(i)
                if (oldVal && !oldVal.includes(c)) {
                    illegalStr = c
                    break
                }
            }
            ElMessage.warning(illegalStr + '不是十六进制字符')
            hexToDec.value.h = oldVal
        }
    } else {
        hexToDec.value.d = ''
    }
})
const decToHex = ref({})
watch(() => decToHex.value.d, (newVal, oldVal) => {
    if (newVal) {
        try {
            decToHex.value.h = BigInt(decToHex.value.d).toString(16)
        } catch (e) {
            // 找出新的字符串中第一个不是数字的位置
            let illegalStr = newVal
            for (let i = 0; i < newVal.length; i++) {
                const c = newVal.charAt(i)
                if (oldVal && !oldVal.includes(c)) {
                    illegalStr = c
                    break
                }
            }
            ElMessage.warning(illegalStr + '不是十进制字符')
            decToHex.value.d = oldVal
        }
    } else {
        decToHex.value.h = ''
    }
})
const hexToText = ref({})
watch(() => hexToText.value.h, (newVal) => {
    if (newVal) {
        try {
            // CryptoJS.enc.Hex.parse方法不会校验输入的字符串是否为十六进制字符串，所以用BigInt("0x" + hexToText.value.h)来校验，如果报错说明输入的字符串不是十六进制字符串
            BigInt("0x" + hexToText.value.h)
            hexToText.value.t = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(hexToText.value.h))
        } catch (e) {
            ElMessage.warning('请输入有效的十六进制编码')
            hexToText.value.t = ''
        }
    } else {
        hexToText.value.t = ''
    }
})
const textToHex = ref({})
watch(() => textToHex.value.t, (newVal) => {
    if (newVal) {
        textToHex.value.h = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(textToHex.value.t))
    } else {
        textToHex.value.h = ''
    }
})
</script>
<template>
    <h3>数字</h3>
    <!-- 十六进制转十进制 -->
    <el-text class="mx-1">十六进制转十进制</el-text>
    <el-input v-model="hexToDec.h" style="width: 480px" placeholder="请输入十六进制数">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(hexToDec.h)" />
        </template>
    </el-input>
    &nbsp;&nbsp;
    <el-input v-model="hexToDec.d" style="width: 480px" readonly>
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(hexToDec.d)" />
        </template>
    </el-input>
    <!-- 十进制转十六进制 -->
    <el-text class="mx-1">十进制转十六进制</el-text>
    <el-input v-model="decToHex.d" style="width: 480px" placeholder="请输入十进制数">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(decToHex.d)" />
        </template>
    </el-input>
    &nbsp;&nbsp;
    <el-input v-model="decToHex.h" style="width: 480px" readonly>
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(decToHex.h)" />
        </template>
    </el-input>

    <h3>文本</h3>
    <!-- 十六进制转文本 -->
    <el-text class="mx-1">十六进制转文本</el-text>
    <el-input v-model="hexToText.h" placeholder="请输入十六进制编码" type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(hexToText.h)" />
        </template>
    </el-input>
    <br>
    <br>
    <el-input v-model="hexToText.t" readonly type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(hexToText.t)" />
        </template>
    </el-input>
    <!-- 文本转十六进制 -->
    <el-text class="mx-1">文本转十六进制</el-text>
    <el-input v-model="textToHex.t" placeholder="文本内容" type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(textToHex.t)" />
        </template>
    </el-input>
    <br>
    <br>
    <el-input v-model="textToHex.h" readonly type="textarea" :autosize="{ minRows: 5, maxRows: 15 }">
        <template #append>
            <el-button :icon="CopyDocument" @click="copyToClipboard(textToHex.h)" />
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