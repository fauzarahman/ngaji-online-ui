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
      <div v-show="continueWatching.length >= 0">
        <div class="row justify-between items-center" style="margin-top: -20px;">
        <h6 class="text-bold">Continue Watching</h6>
        <q-btn flat dense label="See All" color="grey-8" />
        </div>
        <q-scroll-area style="height: 200px;margin-top: -20px;">
        <div class="row no-wrap">
            <q-card
              v-for="log in continueWatching.slice(0, 6)" 
              :key="log.id"
              class="q-mr-md card-style"
              @click="$router.push(`/lesson/${log.parent_id}`)"
            >
              <q-img :src="log.module_detail.thumbnail || 'https://placehold.co/80'" class="card-img" />
              <q-card-section>
                <div class="text-bold">{{ log.module_detail.title || 'Untitled Module' }}</div>
                <div class="text-grey text-caption">By {{ log.module_detail.instructor_profile?.display_name || 'Unknown' }}</div>
                <q-linear-progress :value="log.last_position / log.duration" color="green" class="q-mt-xs" />
                <div class="text-caption text-grey">{{ Math.floor((log.last_position / log.duration) * 100) || 0 }}% Completed</div>
              </q-card-section>
            </q-card>
        </div>
        </q-scroll-area>
      </div>

      <!-- Popular Courses -->
      <div class="row justify-between items-center" style="margin-top: -20px;">
      <h6 class="text-bold">Popular Courses</h6>
      <q-btn flat dense label="See All" color="grey-8" />
      </div>
      <q-scroll-area style="height: 200px;margin-top: -20px;">
      <div class="row no-wrap">
          <q-card v-for="course in courses" :key="course.id" class="col-4 q-mr-md card-style" @click="$router.push(`/module/${course.id}`)">
              <q-img src="https://placehold.co/80" class="card-img" />
              <q-card-section>
              <div class="text-bold">{{ course.title }}</div>
              <div class="text-grey text-caption">By {{ course.instructor_profile.display_name }}</div>
              </q-card-section>
          </q-card>
      </div>
      </q-scroll-area>

      <!-- Recommended For You -->
      <div class="row justify-between items-center"  style="margin-top: -50px;">
      <h6 class="text-bold">Recommended For You</h6>
      <q-btn flat dense label="See All" color="grey-8" />
      </div>
      <q-scroll-area style="height:190px;margin-top: -20px;">
      <div class="row no-wrap">
          <q-card v-for="n in 2" :key="n" class="q-mr-md card-style">
          <q-img src="https://placehold.co/80" class="card-img" />
          <q-card-section>
              <div class="text-bold">Qalqalah</div>
              <div class="text-grey text-caption">By Ajrul Rois</div>
          </q-card-section>
          </q-card>
      </div>
      </q-scroll-area>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import api from "src/config/api";

const profile = ref({});
const courses = ref([]);
const continueWatching = ref([]);
const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));

onMounted(async () => {
// Ambil profile dari localStorage
const profileData = localStorage.getItem('profile');
if (profileData) {
  try {
    profile.value = JSON.parse(profileData);
  } catch (e) {
    console.error('Error parsing profile from localStorage', e);
  }
}

// Fetch modules
try {
  const resModules = await axios.get(`${api.API_BASE_URL}/modules`, {
    headers: {
      Authorization: ` ${accessToken}`
    }
  });
  const { data: modulesData } = resModules.data;
  courses.value = modulesData;
} catch (err) {
  console.error('Error fetching modules', err);
}

// Fetch videologs
try {
  const resLogs = await axios.get(`${api.API_BASE_URL}/videologs`, {
    headers: {
      Authorization: ` ${accessToken}`
    },
    params: { user_id: userId }
  });

  continueWatching.value = (resLogs.data.data || [])
.filter(v => v.is_complete === 0)
.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

} catch (err) {
  console.error('Error fetching videologs', err);
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
</style>
