<template>
  <div class="q-pa-md">
    <!-- Welcome Section -->
    <div class="row items-center hp-profil-header q-mb-md">
      <div class="col">
        <h5 class="text-bold">
          Welcome <span class="text-primary">{{ profile.display_name || 'Guest' }}</span>
        </h5>
      </div>
      <q-btn flat dense round icon="notifications" class="q-mr-sm" />
    </div>

    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <h6 class="text-bold">List Materi</h6>
      <q-btn label="Tambah Materi" color="green" flat rounded dense @click="onAdd" />
    </div>

    <!-- Course List as Vertical Cards -->
    <div class="row  q-gutter-md">
      <q-card
        v-for="course in courses"
        :key="course.id"
        class="col-sm-6 col-md-6 q-mb-md" style="width: 45%;"
        flat
        bordered
      >
        <div class="relative-position">
          <q-img :src="course.thumbnail || 'https://placehold.co/300x200'" class="q-mb-sm" />
    
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="more_vert"
            class="absolute-top-right q-mt-sm q-mr-sm"
          >
            <q-menu auto-close>
              <q-list style="min-width: 100px;">
                <q-item clickable @click="editCourse(course)">
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable @click="deleteCourse(course)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
    
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium">{{ course.title }}</div>
          <div class="text-caption text-grey">By {{ course.author }}</div>
        </q-card-section>
      </q-card>
    </div>    

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const profile = ref({});

onMounted(() => {
  const profileData = localStorage.getItem('profile');
  if (profileData) {
    try {
      profile.value = JSON.parse(profileData);
    } catch (e) {
      console.error('Error parsing profile from localStorage', e);
    }
  }
});

const courses = ref([
  { title: "Qalqalah", author: "Ajrul Rois", thumbnail: null },
  { title: "Ghunnah", author: "Ajrul Rois", thumbnail: null },
  { title: "Gharib", author: "Ajrul Rois", thumbnail: null }
]);

const editCourse = (course) => {
  console.log('Edit course:', course);
};

const deleteCourse = (course) => {
  console.log('Delete course:', course);
};

const onAdd = () => {
  console.log('Tambah Materi');
};
</script>

<style scoped>
.relative-position {
  position: relative;
}
</style>
