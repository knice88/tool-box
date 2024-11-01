import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWsHistory = defineStore('wsHistory', () => {
    // 接口调用的历史记录
    const dataList = ref([])
    // 添加一个新项
    const addItem = (item) => {
        // 添加到列表
        dataList.value.push(item)
        // 最多只保存20个
        if (dataList.value.length > 20) {
            dataList.value.shift()
        }
    }
    const delItem = (index) => {
        dataList.value.splice(index, 1)
    }
    return { dataList, addItem, delItem }
}, { persist: true })