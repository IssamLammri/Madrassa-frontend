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
        path: '/forgot-password',
        name: 'ForgotPasswordPage',
        component: () => import('@/views/ForgotPassword.vue')
    },
    {
        path: '/reset-password/:token',
        name: 'ResetPasswordPage',
        component: () => import('@/views/ResetPassword.vue')
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
        redirect: '/home/children',
        children: [
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue')
            },
            {
                path: 'children',
                name: 'Children',
                component: () => import('@/views/Children.vue')
            },
            {
                path: 'children/:id',
                name: 'ChildDetail',
                component: () => import('@/views/ChildDetail.vue')
            },
            {
                path: 'classes',
                name: 'Classes',
                component: () => import('@/views/Classes.vue')
            },
            {
                path: 'invoices',
                name: 'Invoices',
                component: () => import('@/views/Invoices.vue')
            },
            {
                path: 'invoices/:id',
                name: 'InvoiceDetail',
                component: () => import('@/views/InvoiceDetail.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
