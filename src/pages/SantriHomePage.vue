<template>
  <div class="q-pa-md">
    <!-- Welcome Section -->
    <div class="row items-center hp-profil-header">
      <div class="col">
        <h5 class="text-bold">
          Welcome <span class="text-primary">{{ profile.display_name || 'Guest' }}</span>
        </h5>               
      </div>
      <q-btn flat dense round icon="notifications" class="q-mr-sm" />
    </div>
    
    <!-- Search Bar -->
    <q-input rounded outlined dense placeholder="Search Here">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- Continue Watching -->
    <div v-if="continueWatching.length > 0" style="margin-bottom: -20px;">
      <div class="row justify-between items-center" style="margin-top: -20px;">
        <h6 class="text-bold">Continue Watching</h6>
        <q-btn flat dense label="See All" color="grey-8" />
      </div>
      <q-scroll-area style="height: 220px;margin-top: -20px;">
        <div class="row no-wrap">
          <q-card
            v-for="log in continueWatching.slice(0, 6)" 
            :key="log.id"
            class="q-mr-md card-style"
            :class="{ 'disabled-card': log.module_detail.is_deleted === 1 }"
            @click="log.module_detail.is_deleted !== 1 && $router.push(`/lesson/${log.parent_id}`)"
          >
            <q-img :src="'https://placehold.co/80'" class="card-img" />
            <q-card-section>
              <div class="text-bold">{{ log.module_detail.title || 'Untitled Module' }}</div>
              <div class="text-grey text-caption">
                By {{ log.module_detail.instructor_profile?.display_name || 'Unknown' }}
              </div>

              <q-linear-progress :value="log.last_position / log.duration" color="green" class="q-mt-xs" />
              <div class="text-caption text-grey">
                {{ Math.floor((log.last_position / log.duration) * 100) || 0 }}% Completed
              </div>

              <!-- ⛔ Pelatihan dihapus notice -->
              <div
                v-if="log.module_detail.is_deleted === 1"
                class="bg-red text-white text-caption text-center q-mt-sm"
                style="padding: 4px; border-radius: 4px;opacity: 75%;"
              >
                Pelatihan dihapus
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-scroll-area>
    </div>

    <!-- Section with hardcoded name 'Tajwid' and loop courses -->
    <div class="q-mt-lg">
      <h6 class="text-bold q-mb-sm">Tajwid</h6>

      <!-- Loop through courses of section 'Tajwid' -->
      <q-expansion-item
        v-for="section in sections"
        :key="section.id"
        expand-separator
        dense
        header-class="bg-grey-1 text-black q-px-md q-my-sm q-py-sm rounded-borders shadow-1"
        @show="fetchModules(section.id)"
      >
        <template v-slot:header>
          <div class="row items-center no-wrap q-pa-xs q-gutter-sm" style="width: 100%;">
            <div class="text-subtitle1 col" style="cursor: pointer;">
              {{ section.section_name }}
            </div>
          </div>
        </template>

        <!-- List modules fetched for each course -->
        <q-list bordered separator class="bg-white q-pa-sm rounded-borders shadow-1">
          <q-item v-if="!modulesMap[section.id]">
            <q-item-section>Loading modules...</q-item-section>
          </q-item>

          <q-item
            v-for="module in modulesMap[section.id]"
            :key="module.id"
            clickable
            @click="$router.push(`/module/${module.id}`)"
            class="module-item q-mb-xs"
          >
            <q-item-section avatar>
              <q-avatar square>
                <img :src="module.thumbnail || 'https://placehold.co/60'" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-bold">{{ module.title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import api from "src/config/api";

const profile = ref({});
const courses = ref([]);
const sections = ref([]);
const continueWatching = ref([]);
const modulesMap = ref({});
const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));

const fetchModules = async (sectionId) => {
  if (modulesMap.value[sectionId]) return;

  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: { Authorization: ` ${accessToken}` },
      params: { section_id: sectionId, instructor_id: profile.id, is_deleted: 0 }
    });
    modulesMap.value[sectionId] = res.data.data || [];
  } catch (err) {
    console.error(`Failed to fetch modules for section ${sectionId}:`, err);
    modulesMap.value[sectionId] = [];
  }
};

onMounted(async () => {
  const profileData = localStorage.getItem('profile');
  if (profileData) {
    try {
      profile.value = JSON.parse(profileData);
    } catch (e) {
      console.error('Error parsing profile from localStorage', e);
    }
  }

  // Fetch sections first
  try {
    const sectionsRes = await axios.get(`${api.API_BASE_URL}/sections`, {
      headers: { Authorization: ` ${accessToken}` }
    });
    sections.value = sectionsRes.data.data || [];
  } catch (e) {
    console.error('Failed to fetch sections:', e);
  }

  // Fetch courses and video logs in parallel
  const [modulesResult, logsResult] = await Promise.allSettled([
    axios.get(`${api.API_BASE_URL}/modules`, {
      headers: { Authorization: ` ${accessToken}` }
    }),
    axios.get(`${api.API_BASE_URL}/videologs`, {
      headers: { Authorization: ` ${accessToken}` },
      params: { user_id: userId }
    })
  ]);

  if (modulesResult.status === 'fulfilled') {
    const { data: modulesData } = modulesResult.value.data;
    courses.value = modulesData;
  } else {
    console.error('Failed to fetch modules:', modulesResult.reason);
  }

  if (logsResult.status === 'fulfilled') {
    const videoLogs = logsResult.value.data.data || [];
    continueWatching.value = videoLogs
      .filter(v => v.is_complete === 0)
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
  } else {
    console.error('Failed to fetch videologs:', logsResult.reason);
  }
});
</script>

<style scoped>
.card-style {
  width: 150px;
  border-radius: 12px;
  overflow: hidden;
}
.card-img {
  height: 80px;
}

.module-item {
  transition: background-color 0.2s;
  border-radius: 8px;
}
.module-item:hover {
  background-color: #f0f4f8;
}
</style>
