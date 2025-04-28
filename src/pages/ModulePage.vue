<template>
  <q-page class="q-pa-md">
    <!-- Header with Back Button -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>Lesson 1</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Video Player -->
    <div class="video-container q-mt-md">
      <q-img src="https://placehold.co/600x300" class="video-placeholder">
        <q-icon name="play_circle" size="lg" class="play-icon" />
      </q-img>
    </div>

    <!-- Instructor Profile -->
    <q-card flat bordered class="q-mt-md q-pa-md row items-center">
      <q-avatar size="50px">
        <img src="https://placehold.co/100">
      </q-avatar>
      <div class="q-ml-md">
        <div class="text-bold text-dark">Ajrul Rois</div>
        <div class="text-caption text-grey-7">Imam Masjid Raden Patah</div>
      </div>
    </q-card>

    <!-- Tabs -->
    <q-tabs v-model="tab" class="q-mt-md">
      <q-tab name="lessons" label="Lessons" />
      <q-tab name="quiz" label="Quiz" />
      <q-tab name="discussions" label="Discussions" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- Lessons Tab -->
      <q-tab-panel name="lessons">
        <div v-for="(week, index) in lessons" :key="index">
          <div class="text-h6 q-mt-md">Week {{ index + 1 }}</div>
          <q-card flat bordered v-for="lesson in week" :key="lesson.title" class="q-mt-sm" @click="$router.push('/lesson')">
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
        </div>
      </q-tab-panel>

      <!-- Quiz Tab -->
      <q-tab-panel name="quiz">
        <div class="text-h6">Quiz Section</div>
        <p>Here you can take quizzes for this lesson.</p>
      </q-tab-panel>

      <!-- Discussions Tab -->
      <q-tab-panel name="discussions">
        <div class="text-h6">Discussions</div>
        <p>Join the discussion for this lesson.</p>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const tab = ref("lessons");

    const lessons = ref([
      [
        { title: "Qalqalah Sugra", description: "Lorem ipsum dolor sit amet consectetur. Lectus viverra sed" },
        { title: "Qalqalah Kubra", description: "Lorem ipsum dolor sit amet consectetur. Lectus viverra sed" }
      ],
      [
        { title: "Advanced Qalqalah", description: "Lorem ipsum dolor sit amet consectetur. Lectus viverra sed" }
      ]
    ]);

    const goBack = () => {
      router.go(-1); // Kembali ke halaman sebelumnya
    };

    return { tab, lessons, goBack };
  }
};
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
