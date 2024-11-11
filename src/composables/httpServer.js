import path from 'path';
import { getRandStr, getRandNum } from './common'
import { DOWNLOAD_DIR_KEY } from './constant'
const http = require('http');
const fs = require('fs');
const os = require('os');
const busboy = require('busboy');
const { BrowserWindow } = require('electron')
import Store from 'electron-store';
const store = new Store();

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
    return `${os.homedir()}/Downloads`
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
                const name = filePath.substring(filePath.lastIndexOf('/') + 1);
                const rs = fs.createReadStream(filePath);
                res.setHeader('Content-Disposition', 'attachment; filename=' + name);
                res.setHeader('Content-Type', 'application/force-download');
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
                            <form action="/rec" method="post" enctype="multipart/form-data">
                                <label for="file">选择文件</label>
                                <input type="file" name="file">
                                <br>
                                <br>
                                <br>
                                <label for="textMsg">输入文本</label>
                                <input type="text" name="textMsg">
                                <br>
                                <input type="submit" value="发送">
                            </form>
                        </body>
                    </html>
                `
                res.setHeader('Content-Type', 'text/html');
                res.end(html);
            }
            if (req.url === '/rec') {
                // 处理Content-Type为multipart/form-data的请求
                const bb = busboy({ headers: req.headers });
                let saveTo = '';
                let successTip = ''
                bb.on('file', (name, file, info) => {
                    // 只传文本的时候，还是会走到这里，但是info.filename为undefined
                    // 所以需要判断一下info.filename是否存在
                    if (info.filename) {
                        saveTo = path.join(getDownloadDir(), info.filename)
                        file.pipe(fs.createWriteStream(saveTo))
                        successTip = `上传成功，文件保存到：${saveTo}`
                    }
                });
                bb.on('field', (name, val, info) => {
                    // 处理文本字段
                    if (val) {
                        BrowserWindow.getFocusedWindow().webContents.send('form-msg-updated', val)
                        successTip = '消息发送成功'
                        bb.emit('close');
                    }
                });
                bb.on('close', () => {
                    res.writeHead(200, { 'Connection': 'close' });
                    res.end(`<html>
                        <head>
                            <meta charset="UTF-8" />
                        </head>
                        <body>${successTip}</body>
                        </html>`);
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
