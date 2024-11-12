<script setup>
import { ref } from 'vue'
import JsonEditorVue from 'json-editor-vue3'

const jsonStr = ref('')
</script>

<template>
    <div class="json-viewer-container">
        <JsonEditorVue v-model="jsonStr" currentMode="code" class="content" />
    </div>
</template>

<style>
.json-viewer-container {
    width: 100%;
    height: 800px;
}

.json-viewer-container>.content {
    overflow: auto;
    width: 100%;
    height: 100%;
}

.jsoneditor-menu {
    background-color: var(--el-color-primary-light-3);
    border-bottom-color: var(--el-color-primary-light-3);
}

.jsoneditor {
    /* border-color: var(--el-color-primary-light-3); */
    border-color: #ebebeb;

}

/* 隐藏poweredBy */
.jsoneditor-poweredBy{
    display: none;
}
</style>