import path from 'path';
import { getRandStr, getRandNum } from '../composables/common'
import { DOWNLOAD_DIR_KEY } from '../composables/constant'
const http = require('http');
const fs = require('fs');
const os = require('os');
const busboy = require('busboy');
const { BrowserWindow } = require('electron')
import store from './store';

let port
let server
let keyToPath = {} // 下载链接key与文件路径的映射

const getDownloadDir = () => {
    // 读取配置文件
    const downloadDir = store.get(DOWNLOAD_DIR_KEY)
    if (downloadDir) {
        return downloadDir
    }
    // 默认下载目录为 ~/Downloads
    return path.join(os.homedir(), 'Downloads')
}

export default {
    startServer: (event) => {
        // 随机生成一个端口
        port = getRandNum(1000, 65535)
        server = http.createServer((req, res) => {
            if (req.url.startsWith('/send/')) {
                // 从下载链接中获取key
                const key = req.url.substring(req.url.lastIndexOf('/') + 1)
                const filePath = keyToPath[key]
                if (!filePath) {
                    // 下载链接无效
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Not Found\n');
                    return
                }
                const name = filePath.split(/[/\\]/).pop();
                const rs = fs.createReadStream(filePath);
                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(name));
                res.setHeader('Content-Type', 'application/octet-stream');
                rs.pipe(res);
            }
            if (req.url === '/recPage') {
                // 返回一个html页面，用于接收文件
                // 一个文件输入框，以及一个提交按钮
                // 点击提交按钮，调用 /rec 接口
                const html = `
                    <html>
                        <head>
                            <meta charset="UTF-8" />
                            <title>文件上传</title>
                        </head>
                        <body>
                                <input id="fileInput" type="file" name="file" multiple style="display: none">
                                <input type="hidden" id="fileCreatedTime" name="_createdTimes">
                                <div id="fileInputBtn" style="border: 2px dashed #ccc; padding: 100px; text-align: center; cursor: pointer;">点击选择文件</div>
                                <textarea id="textMsg" name="textMsg" style="display: block; margin: 10px 0; width: 100%; height: 200px; border: 2px dashed #ccc;" placeholder="输入文本"></textarea>
                                <div id="sendBtn" style="width: 20%; height: 40px; background-color: #409eff; text-align: center; line-height: 40px; font-size: 20px; color: white; padding: 10px 50px;border-radius: 10px;">发送</div>
                        </body>
                        <script>
                        const fileInput = document.getElementById('fileInput');
                        const fileInputBtn = document.getElementById('fileInputBtn');
                        const sendBtn = document.getElementById('sendBtn');
                        fileInputBtn.addEventListener('click', (event) => {
                            fileInput.click();
                        });
                        fileInput.addEventListener('change', (event) => {
                            let fileTime = {}
                            let totalSize = 0;
                            let fileNames = [];
                            for (let i = 0; i < event.target.files.length; i++) {
                                const file = event.target.files[i];
                                fileTime[file.name] = file.lastModified; // 获取最后修改时间（用于创建时间）
                                totalSize += file.size;
                                fileNames.push(file.name);
                            }
                            document.getElementById('fileCreatedTime').value = JSON.stringify(fileTime); // 将文件名和创建时间序列化为字符串
                            if (totalSize > 0) {
                                fileInputBtn.innerHTML = '<p>'+fileNames.join('</p><p>')+'</p><p>总大小：'+showSize(totalSize)+'</p>'; // 更新按钮文本
                            } else {
                                fileInputBtn.textContent = '点击选择文件'; // 如果没有选择文件，重置文本
                            }
                        });
                        sendBtn.addEventListener('click', (event) => {
                        const fileInput = document.getElementById('fileInput');
                        const textMsg = document.getElementById('textMsg');
                            const formData = new FormData();
                            formData.append('textMsg', textMsg.value);
                            for (let i = 0; i < fileInput.files.length; i++) {
                                const file = fileInput.files[i];
                                formData.append('file', file, file.lastModified+'_'+file.name);// 文件名改为 时间戳_文件名
                            }
                            fetch('/rec', {
                                method: 'POST',
                                body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message);
                            })
                            .catch(error => {
                                alert(error);
                            });
                        });
                        function showSize(sizeByte) {
                            if (sizeByte < 1024) {
                                return sizeByte + 'B';
                            } else if (sizeByte < 1024 * 1024) {
                                return (sizeByte / 1024).toFixed(2) + 'KB';
                            } else if (sizeByte < 1024 * 1024 * 1024) {
                                return (sizeByte / 1024 / 1024).toFixed(2) + 'MB';
                            }
                            return (sizeByte / 1024 / 1024 / 1024).toFixed(2) + 'GB';
                        }
                        </script>
                    </html>
                `
                res.setHeader('Content-Type', 'text/html');
                res.end(html);
            }
            if (req.url === '/rec') {
                // 处理Content-Type为multipart/form-data的请求
                const bb = busboy({ headers: req.headers, defParamCharset: 'utf-8', defCharset: 'utf-8' });
                let successTip = ''
                const downloadDir = getDownloadDir()
                bb.on('file', (name, file, info) => {
                    // 只传文本的时候，还是会走到这里，但是info.filename为undefined
                    // 所以需要判断一下info.filename是否存在
                    if (info.filename) {
                        // 上传的时候，文件名改为 时间戳_文件名，所以这里需要将文件名改回来
                        const lastModified = info.filename.substring(0, info.filename.indexOf('_'))
                        const fileName = info.filename.substring(info.filename.indexOf('_') + 1)
                        let fullPath = path.join(downloadDir, fileName)
                        // 创建可写流并保存文件
                        const writeStream = fs.createWriteStream(fullPath);
                        file.pipe(writeStream)
                        writeStream.on('finish', () => {
                            // 当文件写入完成后，设置文件的访问时间和修改时间
                            const lastModifiedTime = Number(lastModified) || Date.now(); // 使用提供的最后修改时间，默认为当前时间
                            const parsedTime = new Date(lastModifiedTime);
                            // 设置文件的访问和修改时间
                            fs.utimes(fullPath, parsedTime, parsedTime, (err) => {
                                if (err) {
                                    console.error(`设置文件时间失败: ${err} ${parsedTime}`);
                                } else {
                                    console.log(`设置文件 ${fullPath} 的时间成功`);
                                }
                            });
                        });
                        successTip += `上传成功，文件保存到：${downloadDir}\n`
                    }
                });
                bb.on('field', (name, val, info) => {
                    // 处理文本字段
                    if (val) {
                        BrowserWindow.getAllWindows()[0].webContents.send('form-msg-updated', val)
                        successTip += '消息发送成功\n'
                    }
                });
                bb.on('close', () => {
                    res.writeHead(200, { 'Connection': 'close' });
                    res.end(JSON.stringify({ success: true, message: successTip }));
                });
                req.pipe(bb);
            }
        });
        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error('Address in use, retrying...');
                setTimeout(() => {
                    server.close();
                    port = getRandNum(1000, 65535)
                    server.listen(port, () => {
                        console.log(`Server running at http://localhost:${port}/`);
                    });
                }, 1000);
            }
        });
        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
        });
    },
    stopServer: (event) => {
        server.close()
        keyToPath = {}
        console.log('Server stopped')
    },
    createDownLink: (event, filePath) => {
        const key = getRandStr(4)
        keyToPath[key] = filePath
        return key
    },
    getServerInfo: (event) => {
        const ifaces = os.networkInterfaces();
        let ip = '127.0.0.1'
        for (let dev in ifaces) {
            ifaces[dev].forEach(details => {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    ip = details.address
                }
            });
        }
        return {
            port: port,
            ip: ip,
            downloadDir: getDownloadDir()
        }
    }
}
