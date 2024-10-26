const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const axios = require('axios');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('send-request', handleSendRequest)
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function handleSendRequest(event, method, url, headers, data) {
  let result = {}
  let start = performance.now();
  console.log('send-request', method, url, headers, data)
  if (data && data.isFormData) {
    // 处理formData
    let formData = new FormData()
    for (let key in data) {
      if (key === 'files') {
        // 遍历列表，将文件参数放入formData
        data['files'].forEach(element => {
          const blob = base64ToBlob(element.fileBuffer, element.fileType)
          formData.append('file', blob, element.fileName); // 将 Blob 添加到 FormData 中
        });
      } else {
        // 将普通的参数放入formData
        formData.append(key, data[key])
      }
    }
    data = formData
  }
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

// 将 Base64 字符串转换为 Blob 对象
function base64ToBlob(base64, type = 'application/octet-stream') {
  const byteCharacters = atob(base64); // 解码 Base64 字符串
  const byteNumbers = new Uint8Array(byteCharacters.length); // 创建字节数组

  // 将字符转换为字节
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  // 创建 Blob 对象
  return new Blob([byteNumbers], { type: type });
}