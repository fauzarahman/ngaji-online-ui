<template>
  <q-page class="q-pa-md">
    <!-- Header with Back Button -->
    <q-header elevated class="bg-green-gradient text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ moduleData?.title || 'Lesson' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Video Player -->
    <div v-if="videoReady" class="video-container q-mt-md">
      <video
        ref="videoPlayer"
        class="video-js vjs-default-skin vjs-big-play-centered"
        controls
        playsinline
        allowfullscreen
      ></video>
    </div>
    <div v-else class="video-container q-mt-md">
      <q-img :src="moduleData?.thumbnail || 'https://placehold.co/600x300'" class="video-placeholder">
        <q-icon name="play_circle" size="lg" class="play-icon" />
      </q-img>
    </div>

    <!-- Instructor Profile -->
    <q-card flat bordered class="q-mt-md q-pa-md row items-center">
      <q-avatar size="50px">
        <img :src="moduleData?.instructor_profile?.avatar ? api.API_UPLOADS_URL + '/' +moduleData?.instructor_profile?.avatar : 'https://placehold.co/100'" />
      </q-avatar>
      <div class="q-ml-md">
        <div class="text-bold text-dark">{{ moduleData?.instructor_profile?.display_name || '' }}</div>
        <div class="text-caption text-grey-7">{{ moduleData?.instructor_profile?.jobtitle || '' }}</div>
      </div>
    </q-card>

    <!-- Module Info -->
    <div class="q-mt-md">
      <div class="text-h7 text-dark">{{ moduleData?.title || '' }}</div>
      <div class="text-h6 text-dark-12">{{ moduleData?.description || '' }}</div>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="tab" class="q-mt-md">
      <q-tab name="lessons" label="Lessons" />
      <q-tab name="quiz" label="Quiz" />
      <!-- <q-tab name="discussions" label="Discussions" /> -->
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- Lessons Tab -->
      <q-tab-panel name="lessons">
        <q-card 
          v-for="lesson in lessons" 
          :key="lesson.id" 
          flat 
          bordered 
          class="q-mt-sm" 
          @click="$router.push(`/lesson/${lesson.id}`)"
        >
          <q-item>
            <q-item-section avatar>
              <q-img :src="lesson?.thumbnail ? api.API_UPLOADS_URL + '/' + lesson?.thumbnail :  'https://placehold.co/100x70'" class="lesson-thumbnail">
                <q-icon name="play_circle" class="play-icon" />
              </q-img>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-bold">{{ lesson.title }}</q-item-label>
              <q-item-label caption>{{ lesson.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense round icon="check_circle" />
            </q-item-section>
          </q-item>
        </q-card>
      </q-tab-panel>

      <!-- Quiz Tab -->
      <q-tab-panel name="quiz">
        <div class="text-h6 q-mb-md">Quiz Section</div>
        <div v-if="quizes.length === 0">
          <p class="text-grey">No quiz questions available for this module.</p>
        </div>
        <q-card
          v-for="(q, index) in quizes"
          :key="q.id"
          class="q-mb-md"
        >
          <q-card-section>
            <div class="text-subtitle1 text-bold">Question {{ index + 1 }}</div>
            <div class="q-mt-sm">{{ q.question }}</div>
            <div class="q-mt-md row items-center justify-between">
              <q-btn
                label="Jawab"
                color="primary"
                class="q-mt-md"
                @click="goToAnswerPage(q)"
              />
              <div v-if="isPassed[q.id]" class="q-mt-md q-pa-sm text-black-5 bg-green-3 text-bold">
                Lulus
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Discussions Tab -->
      <!-- <q-tab-panel name="discussions">
        <div class="text-h6">Discussions</div>
        <p>Join the discussion for this lesson.</p>
      </q-tab-panel> -->
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import api from 'src/config/api';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

const router = useRouter();
const route = useRoute();

const tab = ref('lessons');
const moduleData = ref(null);
const lessons = ref([]);
const quizes = ref([]);
const isPassed = ref({});

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));
const moduleId = route.params.id;

const videoPlayer = ref(null);
let player = null;
const videoReady = ref(false);

const goBack = () => {
  router.go(-1);
};

const goToAnswerPage = (question) => {
  router.push({ path: `/quiz-answer/${question.id}` });
};

const checkIfQuizPassed = async (quizId) => {
  try {
    const response = await axios.get(`${api.API_BASE_URL}/answers`, {
      headers: { Authorization: `${accessToken}` },
      params: { quiz_id: quizId, reply_to: userId, is_passed: 1 }
    });
    isPassed.value[quizId] = response.data?.data?.length > 0;
  } catch (error) {
    console.error('Failed to check quiz status:', error);
  }
};

function initVideoJs(videoId) {
  if (player) {
    player.dispose(); // Pastikan clean up
  }

  // Init player
  player = videojs(videoPlayer.value, {
    techOrder: ['youtube'],
    sources: [
      {
        type: 'video/youtube',
        src: `https://www.youtube.com/watch?v=${videoId}`
      }
    ],
    controls: true,
    autoplay: false,
    preload: 'auto',
    youtube: {
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3 // Hide annotations
    },
    responsive: true,
    fluid: true
  });

  // Optional: log ready state
  player.ready(() => {
    console.log('VideoJS player is ready');
  });

  // Optional: handle error
  player.on('error', () => {
    const err = player.error();
    console.error('VideoJS Error:', err);
  });

  // Optional: start at a certain time (for resume feature)
  player.on('loadedmetadata', () => {
    // Example: resume at 10s (replace with your logic)
    // player.currentTime(10);
  });

  // Optional: make sure controls visible
  player.controls(true);
}


onMounted(async () => {
  try {
    const [moduleRes, lessonsRes, quizRes] = await Promise.all([
      axios.get(`${api.API_BASE_URL}/modules?id=${moduleId}&is_deleted=0`, {
        headers: { Authorization: `${accessToken}` }
      }),
      axios.get(`${api.API_BASE_URL}/lessons?module_id=${moduleId}&is_deleted=0`, {
        headers: { Authorization: `${accessToken}` }
      }),
      axios.get(`${api.API_BASE_URL}/quiz?modules_id=${moduleId}&is_deleted=0`, {
        headers: { Authorization: `${accessToken}` }
      })
    ]);

    moduleData.value = moduleRes.data.data[0] || null;
    lessons.value = lessonsRes.data.data;
    quizes.value = quizRes.data.data;

    for (const quiz of quizes.value) {
      await checkIfQuizPassed(quiz.id);
    }

    // Check YouTube video
    const raw = moduleData.value?.video_header_id || '';
    const match = raw.match(/(?:youtu\.be\/|v=)([^&]+)/);
    const videoId = match?.[1];
    if (videoId) {
      videoReady.value = true;
      await nextTick();
      initVideoJs(videoId);
    }

  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

onBeforeUnmount(() => {
  if (player) {
    player.dispose();
    player = null;
  }
});
</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 100%;
}
.video-js {
  width: 100%;
  height: 250px;
  border-radius: 8px;
}
.video-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  color: white;
  opacity: 0.8;
}
.lesson-thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 8px;
}
</style>
