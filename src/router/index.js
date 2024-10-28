import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '@/views/Home.vue'
import Json from '@/views/Json.vue'
import Md5 from '@/views/Md5.vue'
import HttpClient from '@/views/HttpClient.vue'
import Time from '@/views/Time.vue'
import WsClient from '@/views/WsClient.vue'
import QRCode from '@/views/QRCode.vue'

const routes = [
    {
        path: '/', component: Home, children: [
            { path: '/json', component: Json },
            { path: '/md5', component: Md5 },
            { path: '/httpClient', component: HttpClient },
            { path: '/wsClient', component: WsClient },
            { path: '/time', component: Time },
            { path: '/qrcode', component: QRCode },
        ]
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router