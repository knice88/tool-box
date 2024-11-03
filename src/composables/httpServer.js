import { getRandStr, getRandNum } from './common'
const http = require('http');
const fs = require('fs');
const os = require('os');
const busboy = require('busboy');
let port
let server
let keyToPath = {} // 下载链接key与文件路径的映射
const downloadDir = `${os.homedir()}/Downloads`

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
                                <label for="file">选择文件：</label>
                                <input type="file" name="file">
                                <br>
                                <input type="submit" value="上传">
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
                bb.on('file', (name, file, info) => {
                    saveTo = `${downloadDir}/${info.filename}`;
                    file.pipe(fs.createWriteStream(saveTo));
                });
                bb.on('close', () => {
                    res.writeHead(200, { 'Connection': 'close' });
                    res.end(`<html>
                        <head>
                            <meta charset="UTF-8" />
                        </head>
                        <body>上传成功，文件保存到：${saveTo}</body>
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
            downloadDir: downloadDir
        }
    }
}
