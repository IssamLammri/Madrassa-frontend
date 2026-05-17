import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'LoginPage',
        component: () => import('@/views/Login.vue')
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/register',
        name: 'RegisterPage',
        component: () => import('@/views/Register.vue')
    },
    {
        path: '/inscription',
        name: 'InscriptionPage',
        component: () => import('@/views/Inscription.vue')
    },
    {
        path: '/home',
        component: () => import('@/views/HomeView.vue'),
        // Setting a redirect so '/home' automatically loads the dashboard
        redirect: '/home/dashboard',
        children: [
            {
                // Removed the leading '/' to make it relative to /home
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue')
            },
            {
                path: 'contenus', // Matched to your HomeView.vue navigationItems
                name: 'Content',
                component: () => import('@/views/Content.vue')
            },
            {
                path: 'ressources', // Matched to your HomeView.vue navigationItems
                name: 'Resources',
                component: () => import('@/views/Resources.vue')
            },
            {
                path: 'design',
                name: 'Design',
                component: () => import('@/views/DesignSystem.vue')
            },
            {
                path: 'team',
                name: 'Team',
                component: () => import('@/views/Team.vue')
            },
            {
                // Moved inside so the Sidebar stays visible
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router