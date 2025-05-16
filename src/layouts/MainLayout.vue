<template>
  <q-layout view="hHh lpR fFf">
    <!-- Side Menu -->
    <q-drawer v-model="rightDrawerOpen" side="right" show-if-above>
      <q-list>
        <q-item clickable v-ripple :to="dashboardUrl">
          <q-item-section>Home</q-item-section>
        </q-item>

        <!-- Menu ini hanya muncul kalau user admin -->
        <q-item v-if="isAdmin" clickable v-ripple to="/registerguru">
          <q-item-section>Pendaftaran Guru</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Fixed Footer with Menu -->
    <q-footer elevated class="bg-green-gradient text-white">
      <q-tabs :model-value="activeTab">
        <q-tab :name="dashboardUrl" icon="home" @click="$router.push(dashboardUrl)" />
        <q-tab name="/about" icon="info" @click="$router.push('/about')" />
        <q-tab name="/settings" icon="settings" @click="toggleRightDrawer" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'MainLayout',
  setup() {
    const rightDrawerOpen = ref(false);
    const router = useRouter();

    // Ambil role user dari localStorage
    const role = localStorage.getItem('role');

    // Hitung dashboard URL sesuai role
    const dashboardUrl = computed(() => {
      switch (role) {
        case 'santri':
          return '/dashboardsantri';
        case 'guru':
          return '/dashboardguru';
        case 'admin':
          return '/dashboardadmin';
        default:
          return '/dashboard';
      }
    });

    const activeTab = computed(() => router.currentRoute.value.path);

    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value;
    };

    const isAdmin = computed(() => role === 'admin');

    const logout = () => {
      localStorage.clear();
      router.push('/');
    };

    return {
      activeTab,
      rightDrawerOpen,
      toggleRightDrawer,
      logout,
      isAdmin,
      dashboardUrl
    };
  }
};
</script>