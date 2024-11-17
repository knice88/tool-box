const axios = require('axios');
const fs = require('fs');

export default {
    sendRequest: async (event, method, url, headers, data) => {
        let result = {}
        console.log('send-request', method, url, headers, data)
        if (headers['Content-Type'] === 'multipart/form-data') {
            // 处理formData，此时data的格式为
            // {key: value, files: {isFile: true, paths: [path1, path2]}}
            let formData = new FormData()
            for (let key in data) {
                const value = data[key]
                if (typeof value === 'object' && value.isFile) {
                    // 遍历文件路径列表，将文件参数放入formData
                    value.paths.forEach(filePath => {
                        // 读取文件内容
                        const file = new File([fs.readFileSync(filePath)], filePath.split(/[/\\]/).pop())
                        formData.append(key, file)
                    });
                } else {
                    // 将普通的参数放入formData
                    formData.append(key, data[key])
                }
            }
            data = formData
        }
        let start = performance.now();
        await axios({
            method: method,
            url: url,
            headers: headers,
            data: data,
        }).then(res => {
            result.data = res.data
            result.status = res.status
            result.statusText = res.statusText
            result.headers = res.headers
        }).catch(error => {
            if (error.response) {
                // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
                result.data = error.response.data
                result.status = error.response.status
                result.statusText = error.response.statusText
                result.headers = error.response.headers
            } else if (error.request) {
                // 请求已经成功发起，但没有收到响应
                // `error.request` 在浏览器中是 XMLHttpRequest 的实例，
                // 而在node.js中是 http.ClientRequest 的实例
                result.err = '无响应' + error.message
            } else {
                // 发送请求时出了点问题
                result.err = error.message
            }
        });
        let end = performance.now();
        result.time = end - start
        return result
    }
}
