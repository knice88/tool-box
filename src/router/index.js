import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '@/views/Home.vue'
import Json from '@/views/Json.vue'
import Md5 from '@/views/Md5.vue'
import HttpClient from '@/views/HttpClient.vue'
import Time from '@/views/Time.vue'
import WsClient from '@/views/WsClient.vue'
import QRCode from '@/views/QRCode.vue'
import Aes from '@/views/Aes.vue'
import FileTransfer from '@/views/FileTransfer.vue'
import Hex from '@/views/Hex.vue'
import Base64 from '@/views/Base64.vue'
import Guid from '@/views/Guid.vue'

const routes = [
    {
        path: '/', component: Home, children: [
            { path: '/json', component: Json },
            { path: '/md5', component: Md5 },
            { path: '/aes', component: Aes },
            { path: '/httpClient', component: HttpClient },
            { path: '/wsClient', component: WsClient },
            { path: '/time', component: Time },
            { path: '/qrcode', component: QRCode },
            { path: '/fileTransfer', component: FileTransfer },
            { path: '/hex', component: Hex },
            { path: '/base64', component: Base64 },
            { path: '/guid', component: Guid },
        ]
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router