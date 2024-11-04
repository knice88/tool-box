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

<style scoped>
.json-viewer-container {
    width: 100%;
    height: 800px;
}

.json-viewer-container>.content {
    overflow: auto;
    width: 100%;
    height: 100%;
}
</style>