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
        <div class="row justify-between items-center" style="margin-top: -20px;">
        <h6 class="text-bold">Continue Watching</h6>
        <q-btn flat dense label="See All" color="grey-8" />
        </div>
        <q-scroll-area style="height: 240px;">
        <div class="row no-wrap">
            <q-card v-for="n in 2" :key="n" class="q-mr-md card-style">
            <q-img src="https://placehold.co/80" class="card-img" />
            <q-btn flat dense round size="xs" icon="more_vert" class="absolute-top-right q-mt-sm q-mr-sm">
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
            <q-card-section @click="$router.push('/module')">
                <div class="text-bold">Qalqalah</div>
                <div class="text-grey text-caption">By Ajrul Rois</div>
                <q-rating size="14px" :model-value="4" readonly />
                <q-linear-progress value="0.85" color="green" class="q-mt-xs" />
                <div class="text-caption text-grey">85% Completed</div>
            </q-card-section>
            </q-card>
        </div>
        </q-scroll-area>

        <!-- Popular Courses -->
        <div class="row justify-between items-center" style="margin-top: -50px;">
        <h6 class="text-bold">Popular Courses</h6>
        <q-btn flat dense label="See All" color="grey-8" />
        </div>
        <q-scroll-area style="height: 230px;">
        <div class="row no-wrap">
            <q-card v-for="course in courses" :key="course.title" class="col-4 q-mr-md card-style">
                <q-img src="https://placehold.co/80" class="card-img" />
                <q-btn flat dense round size="xs" icon="more_vert" class="absolute-top-right q-mt-sm q-mr-sm">
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
                <q-card-section>
                <div class="text-bold">{{ course.title }}</div>
                <div class="text-grey text-caption">By {{ course.author }}</div>
                <div class="text-caption text-grey">{{ course.desc }}</div>
                </q-card-section>
            </q-card>
        </div>
        </q-scroll-area>

        <!-- Recommended For You -->
        <div class="row justify-between items-center"  style="margin-top: -50px;">
        <h6 class="text-bold">Recommended For You</h6>
        <q-btn flat dense label="See All" color="grey-8" />
        </div>
        <q-scroll-area style="height:190px;">
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
    import { ref, onMounted } from "vue";
    
    const profile = ref({});
    
    // Saat mounted, ambil profile dari localStorage
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
      { title: "Qalqalah", author: "Ajrul Rois", desc: "Lorem ipsum dolor sit amet." },
      { title: "Ghunnah", author: "Ajrul Rois", desc: "Lorem ipsum dolor sit amet." },
      { title: "Gharib", author: "Ajrul Rois", desc: "Lorem ipsum dolor sit amet." },
    ]);

    const editCourse = (course) => {
        console.log('Edit course:', course);
        // Disini bisa buka dialog edit, atau navigasi ke halaman edit
    };
    
    const deleteCourse = (course) => {
        console.log('Delete course:', course);
        // Disini bisa tampilkan konfirmasi delete
    };
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
.relative-position {
    position: relative;
}
</style>
