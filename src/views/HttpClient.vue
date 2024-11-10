<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { getRandStr } from '@/composables/common'
import { ElMessage, dayjs } from 'element-plus'
import { useHttpHistory } from '../stores/httpHistory';
import { DAY_FORMAT_SEC } from '@/composables/constant'

const httpHistoryStore = useHttpHistory()
const options = [{
    value: 'GET',
    label: 'GET',
},
{
    value: 'POST',
    label: 'POST',
},
]
const httpUrl = ref('') // 请求地址
const reqMethod = ref('') // 请求方法
const reqHeaders = ref([]) // 请求头列表
const deleteRow = (index) => {
    reqHeaders.value.splice(index, 1)
}
const onAddItem = () => {
    reqHeaders.value.push({
        key: "",
        value: ""
    })
}
const contentType = ref('applcation/x-www-form-urlencoded') // 请求头Content-Type
const contentTypeOptions = [{
    value: 'applcation/x-www-form-urlencoded',
    label: 'applcation/x-www-form-urlencoded',
},
{
    value: 'applcation/json',
    label: 'applcation/json',
},
{
    value: 'multipart/form-data',
    label: 'multipart/form-data',
},
]
const reqForm = ref([]) // 请求体参数列表
const jsonText = ref('') // json请求体参数
const deleteFormRow = (index) => {
    reqForm.value.splice(index, 1)
}
const onAddFormItem = () => {
    reqForm.value.push({
        fileId: `form-file-${getRandStr(4)}`,
        key: "",
        value: ""
    })
}
// 准备选择文件，将当前行标记为文件类型
const selectFile = async (index) => {
    if (!reqForm.value[index].key) {
        reqForm.value[index].key = 'file' // 文件类型参数名默认为file
    }
    reqForm.value[index].isFile = true
    await nextTick()
    // 打开文件选择框
    document.getElementById(reqForm.value[index].fileId).click()
}
const onFileChange = (event, index) => {
    const file = event.target.files[0]
    if (file) {
        reqForm.value[index].value = window.electronAPI.webUtils.getPathForFile(file)
    } else {
        reqForm.value[index].value = ''
    }
}
const bodyIsText = computed(() => {
    return contentType.value === 'applcation/json'
})
const respResult = ref({})
// 遍历参数对象列表
const fmtParams = (params) => {
    let result = {}
    params.forEach(param => {
        const fmtKey = param.key.trim()
        if (fmtKey) {
            result[fmtKey] = param.value.trim()
        }
    });
    return result
}
const sendRequest = async () => {
    // 先清空上一次的响应结果
    respResult.value = {}
    // 没有http前缀的url，自动添加
    if (!httpUrl.value.startsWith('http')) {
        httpUrl.value = 'http://' + httpUrl.value
    }
    let headers = fmtParams(reqHeaders.value)
    let data
    if (reqMethod.value === 'POST') {
        // Post请求时，以选中的Content-Type为准
        headers['Content-Type'] = contentType.value
        // 根据Content-Type设置请求体
        switch (contentType.value) {
            case 'applcation/x-www-form-urlencoded':
                // 拼接成form-data格式的请求体
                data = reqForm.value.filter(item => item.key.trim()).
                    map(item => encodeURIComponent(item.key.trim()) + '=' + encodeURIComponent(item.value.trim())).
                    join('&')
                break
            case 'applcation/json':
                data = JSON.parse(jsonText.value)
                break
            case 'multipart/form-data':
                data = {}
                reqForm.value.forEach(row => {
                    if (!row.isFile) {
                        // 如果当前参数不是文件类型，将文件添加到data中
                        data[row.key] = row.value
                    } else {
                        // 如果当前参数是文件类型，将文件的绝对路径添加到data中
                        if (!data[row.key]) {
                            // 初始化
                            data[row.key] = {
                                isFile: true,
                                paths: []
                            }
                        }
                        data[row.key].paths.push(row.value)
                    }
                });
                break
        }
    }
    // console.log(reqMethod.value, httpUrl.value, headers, data)
    // 发送请求
    window.electronAPI.sendRequest(
        reqMethod.value.toLowerCase(),
        httpUrl.value,
        headers,
        data
    ).then(res => {
        respResult.value = res
        // 默认打开响应结果的data部分
        activeNames.value = ['1', '3']
    })
    // 保存到最近请求列表
    httpHistoryStore.addItem(
        {
            method: reqMethod.value,
            url: httpUrl.value,
            headers: headers,
            data: data,
            time: dayjs().format(DAY_FORMAT_SEC),
        }
    )
}
onMounted(() => {
    if (httpHistoryStore.dataList.length > 0) {
        const lastItem = httpHistoryStore.dataList[httpHistoryStore.dataList.length - 1]
        copyHistoryItem(lastItem)
    } else {
        // 没有历史记录，默认选择GET请求
        reqMethod.value = options[0].value
    }
})

const copyHistoryItem = (item) => {
    reqMethod.value = item.method
    httpUrl.value = item.url
    contentType.value = item.headers['Content-Type']
    reqHeaders.value = Object.entries(item.headers).map(([key, value]) => ({ key, value }))
    if (item.data) {
        switch (contentType.value) {
            case 'applcation/x-www-form-urlencoded':
                // data: "key1=value1&key2=value2"
                item.data.split('&').forEach(item => {
                    const [key, value] = item.split('=')
                    reqForm.value.push({ key, value })
                })
                break
            case 'applcation/json':
                jsonText.value = JSON.stringify(item.data, null, 2)
                break
            case 'multipart/form-data':
                // data: {key: value, files: {isFile: true, paths: [path1, path2]}}
                Object.keys(item.data).forEach(key => {
                    const value = item.data[key]
                    const fileId = `form-file-${getRandStr(4)}` // 随机生成一个id
                    if (typeof value === 'object' && value.isFile) {
                        value.paths.forEach(path => {
                            // 文件类型参数
                            reqForm.value.push({ key: key, value: path, isFile: true, fileId: fileId })
                        })
                    } else {
                        // 普通参数
                        reqForm.value.push({ key: key, value: item.data[key], fileId: fileId })
                    }
                })
                break
        }
    }
}

watch(respResult, () => {
    if (respResult.value.err) {
        ElMessage.error(respResult.value.err)
    }
})
const activeNames = ref(['1', '3'])
const recentCollapse = ref(['1'])
// 用于展示的倒序列表
const recentHistoryList = computed(() => {
    // 增加srcIndex字段保存原始索引
    return httpHistoryStore.dataList.slice().map((item, index) => { item.srcIndex = index; return item }).reverse()
})
const dataText = computed(() => {
    if (typeof respResult.value.data === 'object') {
        return JSON.stringify(respResult.value.data, null, 2)
    } else {
        return respResult.value.data
    }
})
</script>
<template>
    <el-select v-model="reqMethod" placeholder="Select" style="width: 100px">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <el-input v-model="httpUrl" placeholder="http://example.com" class="h-input"></el-input>
    <el-button type="primary" @click="sendRequest" :disabled="!httpUrl">
        发送<el-icon class="el-icon--right">
            <Promotion />
        </el-icon></el-button>
    <br />
    <el-collapse v-model="recentCollapse">
        <el-collapse-item title="最近请求" name="1" v-if="httpHistoryStore.dataList.length > 0">
            <div style="max-height: 250px; overflow: auto;">
                <el-row :gutter="20" class="recent-title">
                    <el-col :span="2">
                        请求方式
                    </el-col>
                    <el-col :span="15">
                        url
                    </el-col>
                    <el-col :span="5">
                        时间
                    </el-col>
                    <el-col :span="2">
                        操作
                    </el-col>
                </el-row>
                <el-row :gutter="20" class="recent-item" v-for="item, index in recentHistoryList" :key="index">
                    <el-col :span="2" style="color: green">
                        {{ item.method }}
                    </el-col>
                    <el-col :span="15">
                        {{ item.url }}
                    </el-col>
                    <el-col :span="5">
                        {{ item.time }}
                    </el-col>
                    <el-col :span="2">
                        <el-icon @click="copyHistoryItem(item)" title="复制">
                            <Upload />
                        </el-icon>
                        &nbsp;
                        &nbsp;
                        <el-icon @click="httpHistoryStore.delItem(item.srcIndex)">
                            <Delete />
                        </el-icon>
                    </el-col>
                </el-row>
            </div>
        </el-collapse-item>
    </el-collapse>
    <br />
    <!-- Content-Type下拉列表，请求方法为POST时才显示 -->
    <el-select v-model="contentType" placeholder="Content-Type" class="header-select" v-if="reqMethod === 'POST'">
        <el-option v-for="item in contentTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <!-- todo 支持请求头、请求参数、请求体配置 -->
    <el-tabs type="border-card" class="demo-tabs">
        <!-- 请求头 -->
        <el-tab-pane>
            <template #label>
                <span class="custom-tabs-label">
                    <el-icon>
                        <House />
                    </el-icon>
                    <span>请求头</span>
                </span>
            </template>
            <div>
                <el-table :data="reqHeaders" style="width: 100%" max-height="250">
                    <el-table-column fixed prop="key" label="Key" width="400">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.key" placeholder="请输入key"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="Value" width="600">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.value" placeholder="请输入value"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="120">
                        <template #default="scope">
                            <el-button link type="primary" size="small" @click.prevent="deleteRow(scope.$index)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button class="mt-4" style="width: 100%" @click="onAddItem">
                    增加参数
                </el-button>
            </div>
        </el-tab-pane>
        <el-tab-pane v-if="reqMethod === 'POST'">
            <template #label>
                <span class="custom-tabs-label">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>参数</span>
                </span>
            </template>
            <!-- 不为json格式时显示参数表 -->
            <div v-if="!bodyIsText">
                <el-table :data="reqForm" style="width: 100%" max-height="250">
                    <el-table-column fixed prop="key" label="Key" width="400">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.key" placeholder="请输入key" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="Value" width="600">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.value" placeholder="请输入value" :disabled="scope.row.isFile" />
                            <!-- 隐藏的文件输入框 -->
                            <input type="file" style="display: none" :id="scope.row.fileId"
                                :onchange="(event) => onFileChange(event, scope.$index)" />
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="120">
                        <template #default="scope">
                            <el-button link type="primary" size="small" @click.prevent="deleteFormRow(scope.$index)">
                                删除
                            </el-button>
                            <el-button link type="primary" size="small" @click.prevent="selectFile(scope.$index)"
                                v-if="contentType === 'multipart/form-data'">
                                选择文件
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button class="mt-4" style="width: 100%" @click="onAddFormItem">
                    增加参数
                </el-button>
            </div>
            <!-- 为json格式时显示json编辑器 -->
            <div v-else>
                <el-input type="textarea" v-model="jsonText" :autosize="{ minRows: 10, maxRows: 20 }">
                </el-input>
            </div>
        </el-tab-pane>

    </el-tabs>
    <br />
    <el-collapse v-model="activeNames">
        <el-collapse-item title="响应结果" name="1" v-if="respResult.time">
            <el-descriptions class="margin-top" title="" :column="1">
                <el-descriptions-item label="状态码">
                    {{ respResult.status }}
                </el-descriptions-item>
                <el-descriptions-item label="状态信息">
                    {{ respResult.statusText }}
                </el-descriptions-item>
                <el-descriptions-item label="响应时间(ms)">
                    {{ respResult.time }}
                </el-descriptions-item>
            </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title="响应头" name="2" v-if="respResult.headers">
            <el-descriptions class="margin-top" title="" :column="1">
                <el-descriptions-item v-for="value, key in respResult.headers" :key="key" :label="key">
                    {{ value }}
                </el-descriptions-item>
            </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title="响应数据" name="3" v-if="dataText">
            <el-input type="textarea" readonly v-model="dataText" :autosize="{ minRows: 10, maxRows: 20 }"></el-input>
        </el-collapse-item>
    </el-collapse>
</template>

<style scoped>
.h-input {
    width: 50%;
    margin-left: 10px;
    margin-right: 10px;
}

.header-select {
    width: 300px;
    margin-bottom: 10px;
}

.recent-title {
    width: 96%;
    font-size: 15px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-top: 1px solid #dcdfe6;
    color: #606266;
}

.recent-item {
    width: 96%;
    font-size: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-top: 1px solid #dcdfe6;
    color: #606266;
}
</style>