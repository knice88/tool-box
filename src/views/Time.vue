<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/composables/clipboard'
import { Switch } from '@element-plus/icons-vue'
import { DAY_FORMAT_MILL, DAY_FORMAT_SEC } from '@/composables/constant'
import { dayjs } from 'element-plus'

const unit = ref('ms') // 时间单位
const timeFormat = ref(DAY_FORMAT_MILL) // 时间格式
const currentTime = ref(dayjs().valueOf()) // 当前时间戳
const inputDate = ref(dayjs().format(timeFormat.value))   // 日期输入框
const inputTime = ref(dayjs().valueOf())   // 时间戳输入框

const dateToTime = computed(() => {
    if (unit.value === 's') {
        // 秒单位
        return dayjs(inputDate.value, timeFormat.value).unix()
    } else {
        // 毫秒单位
        return dayjs(inputDate.value, timeFormat.value).valueOf()
    }
}) // 根据inputDate计算的时间戳

const timeToDate = computed(() => {
    let timestamp = inputTime.value
    if (unit.value === 's') {
        // 秒单位
        return dayjs.unix(timestamp).format(timeFormat.value)
    } else {
        // 毫秒单位
        return dayjs(timestamp).format(timeFormat.value)
    }
}) // 根据inputTime计算的日期

const switchBtn = ref(false) // 切换按钮
const switchTitle = ref('日期转时间戳') // 转换按钮标题
const onSwitch = () => {
    switchBtn.value = !switchBtn.value
    switchTitle.value = switchBtn.value ? '时间戳转日期' : '日期转时间戳'
}
// 每次修改时间单位时，重新计算当前时间戳
watch(unit, (newVal) => {
    timeFormat.value = newVal === 's' ? DAY_FORMAT_SEC : DAY_FORMAT_MILL
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
    let newVal = dayjs().valueOf()
    if (unit.value === 's') {
        // 换成秒单位，除以1000
        newVal = Math.floor(newVal / 1000)
    }
    currentTime.value = newVal
}
const currentDate = computed(() => {
    let timestamp = currentTime.value
    if (unit.value === 's') {
        // 秒单位
        return dayjs.unix(timestamp).format(timeFormat.value)
    } else {
        // 毫秒单位
        return dayjs(timestamp).format(timeFormat.value)
    }
})
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
            <el-text class="mx-1">当前时间</el-text>
            <br>
            <el-input v-model="currentDate" style="width: 240px" readonly>
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(currentDate)" />
                </template>
            </el-input>
            &nbsp;&nbsp;
            <el-input v-model="currentTime" style="width: 180px" readonly>
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(currentTime)" />
                </template>
            </el-input>
        </div>
        <div class="time-box">
            <el-text class="mx-1">{{ switchTitle }}</el-text>
            <br>
            <el-date-picker v-model="inputDate" type="datetime" placeholder="选择时间" style="width: 240px"
                :format="timeFormat" :value-format="timeFormat" v-if="!switchBtn" />
            <!-- 时间戳输入框 -->
            <el-input v-model.number="inputTime" style="width: 240px" v-else type="number">
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(inputTime)" />
                </template>
            </el-input>
            <el-button type="primary" :icon="Switch" circle @click="onSwitch" class="switch-btn" />
            <!-- 计算得到的时间戳 -->
            <el-input v-model="dateToTime" style="width: 240px" v-if="!switchBtn" readonly>
                <template #append>
                    <el-button :icon="CopyDocument" @click="copyToClipboard(dateToTime)" />
                </template>
            </el-input>
            <!-- 计算得到的日期 -->
            <el-input v-model="timeToDate" style="width: 240px" v-else readonly>
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