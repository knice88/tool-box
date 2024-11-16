<script setup>
import { ref, useTemplateRef, watch, nextTick, onMounted, computed } from 'vue'
import { copyToClipboard } from '@/composables/clipboard';
import { useWsHistory } from '@/stores/wsHistory';
import { ElMessage, dayjs } from 'element-plus';
import { DAY_FORMAT_SEC } from '@/composables/constant'

const wsHistoryStore = useWsHistory()
const chatList = ref([])
const wsUrl = ref('')
const msg = ref('')
// 连接状态，true表示已连接，false表示未连接
const connected = ref(false)
// ws客户端实例
let ws = null
onMounted(() => {
    // 从最近请求列表中获取上次的连接地址
    if (wsHistoryStore.dataList.length > 0) {
        wsUrl.value = wsHistoryStore.dataList[wsHistoryStore.dataList.length - 1].url
        // connect()
    }
})
const recentCollapse = ref(['1'])
// 用于展示的倒序列表
const recentHistoryList = computed(() => {
    // 增加srcIndex字段保存原始索引
    return wsHistoryStore.dataList.slice().map((item, index) => { item.srcIndex = index; return item }).reverse()
})
const connect = () => {
    ws = new WebSocket(wsUrl.value);

    ws.onopen = function (event) {
        connected.value = true;
        // 保存到最近请求列表
        wsHistoryStore.addItem({ url: wsUrl.value, time: dayjs().format(DAY_FORMAT_SEC) })
    };

    ws.onmessage = function (event) {
        // 显示接收到的消息
        chatList.value.push({
            from: 'Server',
            content: event.data,
            time: dayjs().format(DAY_FORMAT_SEC)
        })
    };

    ws.onclose = function (event) {
        connected.value = false
    };

    ws.onerror = function (event) {
        disconnect()
        chatList.value.push({
            from: 'System',
            content: '连接失败',
            time: dayjs().format(DAY_FORMAT_SEC),
            tag: 'warning'
        })
    };
}
const sendMsg = () => {
    if (!msg.value) {
        ElMessage.warning('请输入消息')
        return
    }
    ws.send(msg.value);
    chatList.value.push({
        from: 'Client',
        content: msg.value,
        time: dayjs().format(DAY_FORMAT_SEC)
    })
    // 最后将消息置为空
    msg.value = ''
}
const disconnect = () => {
    ws.close();
    connected.value = false;
    ws = null;
}

const chatAreaRef = useTemplateRef('chat-area')
watch(() => chatList.value.length, async () => {
    await nextTick()
    // 自动滚动到底部
    chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
})
watch(connected, (newVal) => {
    // 连接状态改变时，显示消息
    if (newVal) {
        chatList.value.push({
            from: 'System',
            content: '连接成功',
            time: dayjs().format(DAY_FORMAT_SEC),
            tag: 'success'
        })
    } else {
        chatList.value.push({
            from: 'System',
            content: '已断开连接',
            time: dayjs().format(DAY_FORMAT_SEC),
            tag: 'info'
        })
    }
})
const changeConnection = () => {
    if (connected.value) {
        // 断开连接
        disconnect()
    } else {
        // 连接
        connect()
    }
}
const copyConnection = (url) => {
    if (connected.value) {
        // 先断开原连接
        disconnect()
    }
    wsUrl.value = url
    connect()
}
</script>

<template>
    <div class="header">
        <el-input v-model="wsUrl" placeholder="ws://example.com" class="ws-input"
            @keyup.enter="changeConnection"></el-input>
        <el-button type="primary" @click="connect" :disabled="connected">
            连接<el-icon class="el-icon--right">
                <Connection />
            </el-icon></el-button>
        <el-button type="danger" @click="disconnect" :disabled="!connected">
            断开<el-icon class="el-icon--right">
                <Close />
            </el-icon></el-button>
    </div>
    <el-collapse v-model="recentCollapse" v-if="wsHistoryStore.dataList.length > 0">
        <el-collapse-item title="最近请求" name="1">
            <div style="max-height: 250px; overflow: auto;">
                <el-row :gutter="20" class="recent-item" v-for="item, index in recentHistoryList" :key="index">
                    <el-col :span="17">
                        {{ item.url }}
                    </el-col>
                    <el-col :span="5">
                        {{ item.time }}
                    </el-col>
                    <el-col :span="2">
                        <el-icon @click="copyConnection(item.url)" title="复制">
                            <Upload />
                        </el-icon>
                        &nbsp;
                        &nbsp;
                        <el-icon @click="wsHistoryStore.delItem(item.srcIndex)">
                            <Delete />
                        </el-icon>
                    </el-col>
                </el-row>
            </div>
        </el-collapse-item>
    </el-collapse>
    <div class="chat-area" ref="chat-area">
        <div v-for="(item, index) in chatList" :key="index" style="overflow: hidden;">
            <div v-if="item.from === 'System'" class="row-system">
                <el-tag :type="item.tag">{{ item.content }}&nbsp;&nbsp;&nbsp;{{ item.time }}</el-tag>
            </div>
            <div :class="{ 'row-3': item.from === 'Server', 'row-5': item.from === 'Client' }" v-else>
                {{ item.content }}
                <div :class="{ 'row-info': item.from === 'Server', 'row-info-right': item.from === 'Client' }">
                    <el-text class="mx-1 row-info-time" type="info">{{ item.time }}</el-text>
                    <el-icon @click="copyToClipboard(item.content)" color="gray">
                        <DocumentCopy />
                    </el-icon>
                </div>
            </div>
        </div>
    </div>
    <el-input v-model="msg" placeholder="请输入消息" class="data-input" @keyup.enter="sendMsg"
        :disabled="!connected"></el-input>
    <el-button type="primary" @click="sendMsg" :disabled="!msg || !connected">
        发送<el-icon class="el-icon--right">
            <Promotion />
        </el-icon></el-button>
</template>

<style scoped>
.recent-item {
    width: 96%;
    font-size: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-top: 1px solid #dcdfe6;
    color: #606266;
}

.header {
    margin-bottom: 10px;
}

.ws-input {
    margin-right: 10px;
    width: 80%;
}

.chat-area {
    width: 96%;
    height: 600px;
    border: rgb(196, 192, 192) 1px solid;
    margin-bottom: 10px;
    overflow: auto;
}

.data-input {
    width: 88%;
    margin-right: 10px;
}

.row-system {
    text-align: center;
    margin-bottom: 10px;
    margin-top: 10px;
}

.row-info {
    position: absolute;
    padding: 5px;
    bottom: -35px;
    left: 0;
}

.row-info-right {
    position: absolute;
    padding: 5px;
    bottom: -35px;
    right: 0;
}

.row-info-time {
    margin-right: 10px;
}

/* 以下是对话框样式，https://www.cnblogs.com/yhhBKY/p/12196510.html */

.row-3 {
    margin: 20px auto;
    float: left;
    /* width: 200px; */
    /* height: 50px; */
    padding: 10px;
    line-height: 20px;
    text-align: center;
    position: relative;
    border-radius: 5px;
    border: 1px solid rgb(196, 192, 192);
    margin-left: 20px;
    min-width: 150px;
    max-width: 80%;
    margin-bottom: 35px;
}

.row-3::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    /* 箭头靠右边 */
    /* top: 13px;
    right: -15px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 15px solid rgb(196, 192, 192); */
    /* 箭头靠下边 */
    /* left: 20px;
            bottom: -15px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 15px solid rgb(196, 192, 192); */
    /* 箭头靠左边 */
    top: 13px;
    left: -15px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 15px solid rgb(196, 192, 192);
    /* 箭头靠下边 */
    /* left: 20px;
            top: -15px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 15px solid rgb(196, 192, 192); */
}

.row-3::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    /* 箭头靠右边 */
    /* top: 13px;
    right: -13px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 15px solid #fff; */
    /* 箭头靠下边 */
    /* left: 20px;
            bottom: -13px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 15px solid #fff; */
    /* 箭头靠左边 */
    top: 13px;
    left: -13px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 15px solid #fff;
    /* 箭头靠下边 */
    /* left: 20px;
            top: -13px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 15px solid #fff; */
}

.row-5 {
    margin: 20px auto;
    float: right;
    /* width: 200px; */
    /* height: 50px; */
    padding: 10px;
    line-height: 20px;
    text-align: center;
    position: relative;
    border-radius: 5px;
    background: rgb(108, 219, 4);
    margin-right: 20px;
    min-width: 150px;
    max-width: 80%;
    margin-bottom: 35px;
}

.row-5::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    /* 箭头靠右边 */
    top: 13px;
    right: -15px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 15px solid rgb(108, 219, 4);
    /* 箭头靠下边 */
    /* left: 20px;
            bottom: -15px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 15px solid rgb(108, 219, 4); */
    /* 箭头靠左边 */
    /* top: 13px;
            left: -15px;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 15px solid rgb(108, 219, 4); */
    /* 箭头靠下边 */
    /* left: 20px;
            top: -15px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 15px solid rgb(108, 219, 4); */
}

.row-5::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    /* 箭头靠右边 */
    top: 13px;
    right: -13px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 15px solid rgb(108, 219, 4);
    /* 箭头靠下边 */
    /* left: 20px;
            bottom: -13px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 15px solid #fff; */
    /* 箭头靠左边 */
    /* top: 13px;
            left: -13px;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 15px solid #fff; */
    /* 箭头靠下边 */
    /* left: 20px;
            top: -13px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 15px solid #fff; */
}
</style>