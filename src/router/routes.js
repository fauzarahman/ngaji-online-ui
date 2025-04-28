import LoginPage from "src/layouts/LoginPage.vue";
import RegisterPage from "src/layouts/Register.vue";
import { jwtDecode } from "jwt-decode";

const routes = [
  { 
    path: "/", component: LoginPage,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            next("/dashboard"); // Jika sudah login, redirect ke dashboard
          } else {
            localStorage.removeItem("token");
            next(); // Token kadaluarsa, tetap di halaman login
          }
        } catch (error) {
          localStorage.removeItem("token");
          next(); // Token tidak valid, tetap di halaman login
        }
      } else {
        next(); // Tidak ada token, biarkan masuk ke halaman login
      }
    } 
  },
  {
    path: "/register", component: RegisterPage
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/module',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ModulePage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },
  {
    path: '/lesson',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LessonPage.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (!token) {
        next("/");
      } else {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); // Remove expired token
            next("/");
          } else {
            next();
          }
        } catch (error) {
          localStorage.removeItem("token");
          next("/");
        }
      }
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
