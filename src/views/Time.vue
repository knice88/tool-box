<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/composables/clipboard'
import { Switch } from '@element-plus/icons-vue'

const unit = ref('ms') // 时间单位
const currentTime = ref(new Date().getTime()) // 当前时间戳
const inputDate = ref(new Date().toLocaleString())   // 日期输入框
const inputTime = ref(new Date().getTime())   // 日期输入框
const dateToTime = computed(() => {
    let time = new Date(inputDate.value).getTime() // 毫秒时间戳
    if (unit.value ==='s') {
        // 换成秒单位，除以1000
        time = Math.floor(time / 1000)
    }
    return time
}) // 根据inputDate计算的时间戳
const timeToDate = computed(() => {
    let timestamp = inputTime.value
    if (unit.value ==='s') {
        // 当前单位是秒，new Date需要传入毫秒时间戳，乘以1000
        timestamp = timestamp * 1000
    }
    return new Date(timestamp).toLocaleString()
}) // 根据inputTime计算的日期

const switchBtn = ref(false) // 切换按钮
const switchTitle = ref('日期转时间戳') // 转换按钮标题
const onSwitch = () => {
    switchBtn.value = !switchBtn.value
    switchTitle.value = switchBtn.value ? '时间戳转日期' : '日期转时间戳'
}
// 每次修改时间单位时，重新计算当前时间戳
watch(unit, (newVal) => {
    flushCurrentTime()
    if (newVal === 's') {
        // 换成秒单位，除以1000
        inputTime.value = Math.floor(inputTime.value / 1000)
    } else {
        // 换成毫秒单位，乘以1000
        inputTime.value = inputTime.value * 1000
    }
})
const flushCurrentTime = () => {
    let newVal = new Date().getTime()
    if (unit.value === 's') {
        // 换成秒单位，除以1000
        newVal = Math.floor(newVal / 1000)
    }
    currentTime.value = newVal
}
let timer = null;
onMounted(() => {
    timer = setInterval(flushCurrentTime, 1000)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<template>
    <div>
        <div>
            <el-radio-group v-model="unit">
                <el-radio value="ms">毫秒</el-radio>
                <el-radio value="s">秒</el-radio>
            </el-radio-group>
        </div>
        <!-- 显示当前时间和时间戳 -->
        <div class="time-box">
            <el-text class="mx-1">当前时间戳</el-text>
            <br>
            <el-input v-model="currentTime" style="width: 180px" readonly>
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(currentTime)" />
                </template>
            </el-input>
        </div>
        <div class="time-box">
            <el-text class="mx-1">{{ switchTitle }}</el-text>
            <br>
            <!-- 日期输入框 -->
            <el-input v-model="inputDate" style="width: 300px" v-if="!switchBtn">
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(inputDate)" />
                </template>
            </el-input>
            <!-- 时间戳输入框 -->
            <el-input v-model.number="inputTime" style="width: 300px" v-else type="number">
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(inputTime)" />
                </template>
            </el-input>
            <el-button type="primary" :icon="Switch" circle @click="onSwitch" class="switch-btn" />
            <!-- 计算得到的时间戳 -->
            <el-input v-model="dateToTime" style="width: 300px" v-if="!switchBtn" readonly>
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(dateToTime)" />
                </template>
            </el-input>
            <!-- 计算得到的日期 -->
            <el-input v-model="timeToDate" style="width: 300px" v-else readonly>
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(timeToDate)" />
                </template>
            </el-input>
        </div>
    </div>
</template>

<style scoped>
.time-box {
    margin-top: 10px;
    margin-bottom: 10px;
    line-height: 35px;
}

.switch-btn {
    margin-left: 10px;
    margin-right: 10px;
}
</style>