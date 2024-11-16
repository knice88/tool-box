import Store from 'electron-store';
const store = new Store();

export default {
    get: (key) => store.get(key),
    getSetting: (event, key) => {
        // 获取设置
        return store.get(key);
    },
    setSetting: (event, key, value) => {
        // 更新设置
        store.set(key, value);
    },
}