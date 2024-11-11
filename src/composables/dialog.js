import { dialog } from 'electron';

export const selectFolder = (event, defaultPath) => {
    return dialog.showOpenDialogSync(null, {
        title: '选择文件夹',
        defaultPath: defaultPath,
        properties: ['openDirectory']
    })
}