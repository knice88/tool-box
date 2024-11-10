<script setup>
import { useTemplateRef } from 'vue';

const props = defineProps({
    index: Number
})
const emits = defineEmits(['on-file-change'])

const fileRef = useTemplateRef('file');
const onFileChange = (event) => {
    emits('on-file-change', event, props.index);
}
</script>
<template>
    <input type="file" style="display: none" ref="file" :onchange="onFileChange" />
    <el-button link type="primary" size="small" @click.prevent="fileRef.click()">
        选择文件
    </el-button>
</template>