<template>
  <class class="q-pa-md">
    <!-- Header with Back Button -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>Qalqalah Sugra</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Video Player -->
    <div class="video-container">
      <q-img src="https://placehold.co/600x300" class="video-placeholder">
        <q-icon name="play_circle" size="lg" class="play-icon" />
      </q-img>
    </div>

    <!-- Instructor Profile -->
    <div flat bordered class="q-mt-md q-px-sm q-pb-md row items-center">
      <q-avatar size="50px">
        <img src="https://placehold.co/100">
      </q-avatar>
      <div class="q-ml-md">
        <div class="text-bold text-dark">Ajrul Rois</div>
        <div class="text-caption text-grey-7">Imam Masjid Raden Patah</div>
      </div>
    </div>

    <div class="q-mt-md q-px-sm q-pb-md row items-center">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
      when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
      It has survived not only five centuries, but also the leap into electronic typesetting
    </div>
  </class>
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
