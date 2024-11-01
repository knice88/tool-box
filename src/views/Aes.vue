<script setup>
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
const isBase64 = ref('Hex');
const inputText = ref('')
const outputText = ref('')
const formInline = ref({
    mode: 'ECB',
    keyType: 'Utf8',
    ivType: 'Utf8',
    pad: 'Pkcs7'
})
const encrypt = () => {
    outputText.value = ''
    const crypto_key = CryptoJS.enc[formInline.value.keyType].parse(formInline.value.key);

    let cfg = {};
    (formInline.value.mode !== "ECB") && (cfg.iv = CryptoJS.enc[formInline.value.ivType].parse(formInline.value.iv));
    cfg.mode = CryptoJS.mode[formInline.value.mode];
    cfg.padding = CryptoJS.pad[formInline.value.pad];

    const cryptoData = CryptoJS.AES.encrypt(inputText.value, crypto_key, cfg).ciphertext.toString(isBase64.value === 'Base64' ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex)
    // 检查同样的配置能不能解密，如果不能解密，则不返回结果而是提示错误
    // 在选择NoPadding模式的情况下，加密得到的结果可能无法解密
    let checkResult
    try {
        const checkCryptoData = isBase64.value === 'Base64' ? cryptoData : CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(cryptoData));
        checkResult = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(checkCryptoData, crypto_key, cfg))
    } catch (err) {
        if (formInline.value.pad === 'NoPadding') {
            ElMessage.error('加密结果校验失败, 可以尝试将NoPadding换成其它选项')
        } else {
            ElMessage.error('加密失败' + err.message)
        }
        return
    }
    if (checkResult !== inputText.value) {
        ElMessage.error('加密不可逆')
        return
    }
    outputText.value = cryptoData
}
const decrypt = () => {
    outputText.value = ''
    const crypto_key = CryptoJS.enc[formInline.value.keyType].parse(formInline.value.key);

    let cfg = {};
    (formInline.value.mode !== "ECB") && (cfg.iv = CryptoJS.enc[formInline.value.ivType].parse(formInline.value.iv));
    cfg.mode = CryptoJS.mode[formInline.value.mode];
    cfg.padding = CryptoJS.pad[formInline.value.pad];

    const cryptoData = isBase64.value === 'Base64' ? inputText.value : CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(inputText.value));
    const decrypt = CryptoJS.AES.decrypt(cryptoData, crypto_key, cfg)
    outputText.value = CryptoJS.enc.Utf8.stringify(decrypt);
}

const calcKeyBits = computed(() => {
    // 不判断的话，key默认是undefined，会计算出字节数为72
    if (formInline.value.keyType && formInline.value.key) {
        return CryptoJS.enc[formInline.value.keyType].parse(formInline.value.key).sigBytes * 8
    }
    return 0
})

const calcIvBits = computed(() => {
    // 不判断的话，iv默认是undefined，会计算出字节数为72
    if (formInline.value.ivType && formInline.value.iv) {
        return CryptoJS.enc[formInline.value.ivType].parse(formInline.value.iv).sigBytes * 8
    }
    return 0
})
</script>
<template>
    <el-input type="textarea" v-model="inputText" :autosize="{ minRows: 10, maxRows: 20 }"
        style="margin-bottom: 10px;"></el-input>
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="编码">
            <el-select v-model="isBase64" style="width: 92px;">
                <el-option label="Base64" value="Base64" />
                <el-option label="Hex" value="Hex" />
            </el-select>
        </el-form-item>
        <el-form-item label="模式">
            <el-select v-model="formInline.mode" style="width: 80px;">
                <el-option label="ECB" value="ECB" />
                <el-option label="CBC" value="CBC" />
                <el-option label="CFB" value="CFB" />
                <el-option label="OFB" value="OFB" />
                <el-option label="CTR" value="CTR" />
            </el-select>
        </el-form-item>
        <el-form-item label="密钥">
            <el-input v-model="formInline.key" clearable class="input-with-select">
                <template #prepend>
                    <el-select v-model="formInline.keyType" placeholder="编码" style="width: 92px">
                        <el-option label="Utf8" value="Utf8" />
                        <el-option label="Base64" value="Base64" />
                        <el-option label="Hex" value="Hex" />
                    </el-select>
                </template>
                <template #suffix>
                    <div style="border-left: 1px solid var(--el-border-color); text-align: center;">
                        {{ calcKeyBits }}bits
                    </div>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="偏移量">
            <el-input v-model="formInline.iv" clearable class="input-with-select" :disabled="formInline.mode === 'ECB'">
                <template #prepend>
                    <el-select v-model="formInline.ivType" placeholder="编码" style="width: 92px">
                        <el-option label="Utf8" value="Utf8" />
                        <el-option label="Base64" value="Base64" />
                        <el-option label="Hex" value="Hex" />
                    </el-select>
                </template>
                <template #suffix>
                    <div style="border-left: 1px solid var(--el-border-color); text-align: center;">
                        {{ calcIvBits }}bits</div>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="填充方式">
            <el-select v-model="formInline.pad" style="width: 128px;">
                <el-option label="Pkcs7" value="Pkcs7" />
                <el-option label="Iso10126" value="Iso10126" />
                <el-option label="NoPadding" value="NoPadding" />
                <el-option label="ZeroPadding" value="ZeroPadding" />
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="encrypt">加密</el-button>
            <el-button type="primary" @click="decrypt">解密</el-button>
        </el-form-item>
    </el-form>
    <el-input type="textarea" v-model="outputText" :autosize="{ minRows: 10, maxRows: 20 }" readonly></el-input>
</template>
