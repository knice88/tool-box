<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Buffer } from 'buffer'; // 导入 Buffer
import { ElMessage } from 'element-plus'
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
        key: "",
        value: ""
    })
}
// 准备选择文件，将当前行标记为文件类型
const selectFile = (index) => {
    reqForm.value[index].isFile = true
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
        // Post请求时，没有手动输入Content-Type，则默认值为选中的Content-Type
        if (!headers['Content-Type']) {
            headers['Content-Type'] = contentType.value
        }
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
                await sendFormData().then(formData => {
                    data = formData
                })
                reqForm.value.forEach(row => {
                    if (!row.isFile) {
                        // 如果当前参数不是文件类型，将文件添加到FormData中
                        data[row.key] = row.value
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
    })
}
async function sendFormData() {
    const data = {
        isFormData: true, // 标记为 FormData 类型
        files: [] // 文件对象列表
    };

    // 创建 Promise 数组来处理异步文件读取
    const fileReadPromises = [];
    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            const fileReadPromise = new Promise((resolve) => {
                reader.onloadend = function () {
                    const byteArray = new Uint8Array(reader.result); // 转换为 Uint8Array
                    const fileBuffer = Buffer.from(byteArray).toString('base64'); // 转换为 Base64
                    data["files"].push({
                        fileName: file.name,
                        fileType: file.type,
                        fileBuffer: fileBuffer
                    }) // 记录文件信息
                    // console.log("进入file", file.name, byteArray, file);
                    resolve(); // 文件读取完成，解决 Promise
                };
                reader.readAsArrayBuffer(file); // 开始读取文件
            });

            fileReadPromises.push(fileReadPromise);
        }
    });

    // 等待所有文件读取完成
    await Promise.all(fileReadPromises);
    return data
}
watch(respResult, () => {
    if (respResult.value.err) {
        ElMessage.error(respResult.value.err)
    }
})
onMounted(() => {
    reqMethod.value = options[0].value
})
const activeNames = ref(['1', '3'])
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
    <el-input v-model="httpUrl" placeholder="http://example.com" style="width: 50%;">httpClient</el-input>
    <el-button type="primary" @click="sendRequest" :disabled="!httpUrl">
        发送<el-icon class="el-icon--right">
            <Promotion />
        </el-icon></el-button>
    <br />
    <br />
    <!-- Content-Type下拉列表，请求方法为POST时才显示 -->
    <el-select v-model="contentType" placeholder="Content-Type" style="width: 300px" v-if="reqMethod === 'POST'">
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
                            <el-input v-model="scope.row.key" placeholder="请输入key"
                                :disabled="scope.row.isFile"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="Value" width="600">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.value" placeholder="请输入value"
                                :type="scope.row.isFile ? 'file' : 'text'"></el-input>
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
    <div class="demo-collapse">
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
                <el-input type="textarea" readonly v-model="dataText"
                    :autosize="{ minRows: 10, maxRows: 20 }"></el-input>
            </el-collapse-item>
        </el-collapse>
    </div>

</template>

<style scoped></style>