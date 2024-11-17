<script setup>
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid';

const config = ref({ count: 1, prefix: '', suffix: '' })
const resultText = ref('')
watch(config, () => {
    const { count, isUpper, hasHyphen, prefix, suffix } = config.value
    const result = []
    for (let i = 0; i < count; i++) {
        let str = uuidv4()
        if (isUpper) {
            str = str.toUpperCase()
        }
        if (!hasHyphen) {
            str = str.replace(/-/g, '')
        }
        result.push(prefix + str + suffix)
    }
    resultText.value = result.join('\n')
}, { deep: true, immediate: true })
</script>

<template>
    <el-switch v-model="config.isUpper" class="ml-2" style="--el-switch-on-color: #13ce66;" /><el-text
        class="mx-1">大写</el-text>
    &nbsp;&nbsp;
    <el-switch v-model="config.hasHyphen" class="ml-2" style="--el-switch-on-color: #13ce66;" /><el-text
        class="mx-1">带连字符</el-text>
    &nbsp;&nbsp;
    <el-input style="width: 280px" v-model.number="config.count" min="1">
        <template #prepend>
            数量
        </template>
    </el-input>
    &nbsp;
    <el-input style="width: 280px" v-model="config.prefix">
        <template #prepend>
            UUID前缀
        </template>
    </el-input>
    &nbsp;
    <el-input style="width: 280px" v-model="config.suffix">
        <template #prepend>
            UUID后缀
        </template>
    </el-input>
    <br>
    <br>
    <br>
    <el-input type="textarea" v-model="resultText" :autosize="{ minRows: 15, maxRows: 20 }" readonly></el-input>
</template>
