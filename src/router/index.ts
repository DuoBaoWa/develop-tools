import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'

let isInitRouter = false
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'toolList',
        component: () => import('@/pages/toolList/ToolList.vue'),
    },
    {
        path:'/tool/',
        name:"tool",
        component: () => import('@/pages/toolFrame/ToolFrame.vue'),
    },
    {
        path: '/index.html',
        redirect: '/',
    }
]
const toolModules = import.meta.glob('@/toolPages/*/index.vue') as Record<string, () => Promise<any>>;
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})
async function initRouter() {
    console.log("动态注册路由")
    for (const toolPath in toolModules) {
        const toolModulePromise = toolModules[toolPath](); // 加载 Vue 组件
        await toolModulePromise.then((module) => {
            const routerTag = toolPath.split('toolPages/').pop()?.split('/index.vue')[0];
            const route: RouteRecordRaw = {
                path: `/tool/${routerTag}`,
                name: `${routerTag}`,
                component: module.default,
            };
            router.addRoute("tool",route)
            console.log("路由注册", route.name)
        }).catch((error) => {
            console.error(`工具加载失败:${toolPath}`, error);
        });
    }
}

router.beforeEach(async (to, _) => {
    if (!isInitRouter) {
        await initRouter()
        isInitRouter=true
        return {path:to.fullPath}
    }
    return true
})

export default router
