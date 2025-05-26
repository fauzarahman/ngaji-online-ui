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
    <div class="video-container q-mt-md">
      <q-img :src="moduleData?.thumbnail || 'https://placehold.co/600x300'" class="video-placeholder">
        <q-icon name="play_circle" size="lg" class="play-icon" />
      </q-img>
    </div>

    <!-- Instructor Profile -->
    <q-card flat bordered class="q-mt-md q-pa-md row items-center">
      <q-avatar size="50px">
        <img src="https://placehold.co/100" />
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
      <q-tab name="discussions" label="Discussions" />
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
              <q-img src="https://placehold.co/100x70" class="lesson-thumbnail">
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
      
            <!-- Tampilkan soal berupa teks -->
            <div class="q-mt-sm">
              {{ q.question }}
            </div>

            <!-- Tombol Jawab -->
            <div class="q-mt-md row items-center justify-between">
              <q-btn
                label="Jawab"
                color="primary"
                class="q-mt-md"
                @click="goToAnswerPage(q)"
              />
              <!-- Tandai sebagai Lulus -->
              <div v-if="isPassed[q.id]" class="q-mt-md q-pa-sm text-black-5 bg-green-3 text-bold">
                Lulus
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
      

      <!-- Discussions Tab -->
      <q-tab-panel name="discussions">
        <div class="text-h6">Discussions</div>
        <p>Join the discussion for this lesson.</p>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import api from 'src/config/api';

const router = useRouter();
const route = useRoute();

const tab = ref('lessons');
const moduleData = ref(null);
const lessons = ref([]);
const quizes = ref([]);
const isPassed = ref({});  // Menyimpan status lulus untuk setiap quiz

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));
const moduleId = route.params.id;

// Fungsi untuk memeriksa apakah quiz sudah lulus
const checkIfQuizPassed = async (quizId) => {
  try {
    const response = await axios.get(`${api.API_BASE_URL}/answers`, {
      headers: { Authorization: `${accessToken}` },
      params: {
        quiz_id: quizId,
        reply_to: userId,
        is_passed: 1
      }
    });

    // Jika ada jawaban yang lulus
    if (response.data?.data?.length > 0) {
      isPassed.value[quizId] = true;  // Tandai quiz sebagai "Lulus"
    } else {
      isPassed.value[quizId] = false; // Quiz belum lulus
    }
  } catch (error) {
    console.error('Failed to check if quiz is passed:', error);
  }
};

// Fungsi untuk navigasi kembali
const goBack = () => {
  router.go(-1);
};

const goToAnswerPage = (question) => {
  router.push({
    path: `/quiz-answer/${question.id}`
  });
};

// Ambil data module, lessons, dan quizzes
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

    const { data: moduleDataArray } = moduleRes.data;
    const { data: lessonsDataArray } = lessonsRes.data;
    const { data: quizDataArray } = quizRes.data;

    moduleData.value = moduleDataArray[0] || null;
    lessons.value = lessonsDataArray;
    quizes.value = quizDataArray;

    // Cek status lulus untuk setiap quiz
    for (const quiz of quizDataArray) {
      await checkIfQuizPassed(quiz.id);
    }

  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});
</script>

<style scoped>
.video-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: #ccc;
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
