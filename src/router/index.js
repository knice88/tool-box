import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '@/views/Home.vue'
import Json from '@/views/Json.vue'
import Md5 from '@/views/Md5.vue'
import HttpClient from '@/views/HttpClient.vue'

const routes = [
    {
        path: '/', component: Home, children: [
            { path: '/json', component: Json },
            { path: '/md5', component: Md5 },
            { path: '/httpClient', component: HttpClient },
        ]
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router