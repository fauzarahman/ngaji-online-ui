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
      <h6 class="text-bold">Daftar Modul</h6>
      <q-btn label="Tambah Modul" color="green" flat rounded dense @click="onAddModule" />
    </div>

    <!-- Course List as a List (using q-item) -->
    <div class="q-gutter-md">
      <q-item
        v-for="course in courses"
        :key="course.id"
        class="q-mb-md"
        clickable
        @click="editCourse(course)"
        bordered
      >
        <q-item-section>
          <q-item-label class="text-h6 text-weight-medium">{{ course.title }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="more_vert"
            @click.stop
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
        </q-item-section>
      </q-item>
    </div>

    <!-- Load More Button for Courses -->
    <q-btn
      label="Tampilkan lebih banyak"
      flat
      class="full-width q-mt-md"
      @click="loadMoreCourses"
      :loading="loadingCourses"
      :disable="loadingCourses || !hasMoreCourses"
    />

    <!-- List Lessons -->
    <div class="row items-center justify-between q-mt-md q-mb-md">
      <h6 class="text-bold">Daftar Pelatihan</h6>
      <q-btn label="Tambah Pelatihan" color="green" flat rounded dense @click="onAddLesson" />
    </div>

    <!-- Lessons List as a List (using q-item) -->
    <div class="q-gutter-md">
      <q-item
        v-for="lesson in lessons"
        :key="lesson.id"
        class="q-mb-md"
        clickable
        @click="editLesson(lesson)"
        bordered
      >
        <q-item-section>
          <q-item-label class="text-h6 text-weight-medium">{{ lesson.title }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="more_vert"
            @click.stop
          >
            <q-menu auto-close>
              <q-list style="min-width: 100px;">
                <q-item clickable @click="editLesson(lesson)">
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable @click="deleteLesson(lesson)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
    </div>

    <!-- Load More Button for Lessons -->
    <q-btn
      label="Tampilkan lebih banyak"
      flat
      class="full-width q-mt-md"
      @click="loadMoreLessons"
      :loading="loadingLessons"
      :disable="loadingLessons || !hasMoreLessons"
    />

    <!-- List Quiz -->
    <div class="row items-center justify-between q-mt-md q-mb-md">
      <h6 class="text-bold">Daftar Quiz</h6>
      <q-btn label="Tambah Quiz" color="green" flat rounded dense @click="onAddQuiz" />
    </div>

    <!-- Quiz List as a List (using q-item) -->
    <div class="q-gutter-md">
      <q-item
        v-for="quiz in quizzes"
        :key="quiz.id"
        class="q-mb-md"
        clickable
        @click="editQuiz(quiz)"
        bordered
      >
        <q-item-section>
          <q-item-label class="text-h6 text-weight-medium ellipsis-text">{{ quiz.question }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="more_vert"
            @click.stop
          >
            <q-menu auto-close>
              <q-list style="min-width: 100px;">
                <q-item clickable @click="editQuiz(quiz)">
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable @click="deleteQuiz(quiz)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
    </div>

    <!-- Load More Button for Quizzes -->
    <q-btn
      label="Tampilkan lebih banyak"
      flat
      class="full-width q-mt-md"
      @click="loadMoreQuizzes"
      :loading="loadingQuizzes"
      :disable="loadingQuizzes || !hasMoreQuizzes"
    />
  </div>
</template>

<script setup>
  import { useQuasar } from 'quasar'
  const $q = useQuasar()
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  import api from "src/config/api";
  
  const router = useRouter();
  
  const profile = ref({});
  const courses = ref([]);
  const quizzes = ref([]);
  const lessons = ref([]);
  const accessToken = localStorage.getItem('token');
  const instructorId = localStorage.getItem('id');
  
  // Paging for Courses
  const skipCourses = ref(0);
  const limitCourses = 10;
  const loadingCourses = ref(false);
  const hasMoreCourses = ref(true);

  // Paging for Quizzes
  const skipQuizzes = ref(0);
  const limitQuizzes = 10;
  const loadingQuizzes = ref(false);
  const hasMoreQuizzes = ref(true);

  // Paging for Lessons
  const skipLessons = ref(0);
  const limitLessons = 10;
  const loadingLessons = ref(false);
  const hasMoreLessons = ref(true);
  
  // Ambil profile dari localStorage
  onMounted(async () => {
    const profileData = localStorage.getItem('profile');
    if (profileData) {
      try {
        profile.value = JSON.parse(profileData);
      } catch (e) {
        console.error('Error parsing profile from localStorage', e);
      }
    }
  
    // Load pertama kali untuk kursus, quiz, dan lessons
    await fetchCourses();
    await fetchQuizzes();
    await fetchLessons();
  });
  
  // Fungsi untuk mengambil data kursus berdasarkan skip dan limit
  const fetchCourses = async () => {
    if (loadingCourses.value) return;
    loadingCourses.value = true;
  
    try {
      const res = await axios.get(`${api.API_BASE_URL}/modules`, {
        headers: { Authorization: ` ${accessToken}` },
        params: { 
          instructor_id: instructorId,
          is_deleted: 0,
          $skip: skipCourses.value, 
          $limit: limitCourses
        }
      });
      
      const fetchedCourses = res.data.data || [];
      
      if (fetchedCourses.length > 0) {
        courses.value.push(...fetchedCourses);
      }
  
      hasMoreCourses.value = fetchedCourses.length === limitCourses;
  
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      loadingCourses.value = false;
    }
  };

  // Fungsi untuk mengambil data quiz berdasarkan skip dan limit
  const fetchQuizzes = async () => {
    if (loadingQuizzes.value) return;
    loadingQuizzes.value = true;

    try {
      const res = await axios.get(`${api.API_BASE_URL}/quiz`, {
        headers: { Authorization: ` ${accessToken}` },
        params: { 
          created_by: instructorId,  // Filter berdasarkan instructor_id pada module
          is_deleted: 0,
          $skip: skipQuizzes.value, 
          $limit: limitQuizzes,
        }
      });

      const fetchedQuizzes = res.data.data || [];

      if (fetchedQuizzes.length > 0) {
        quizzes.value.push(...fetchedQuizzes);
      }

      hasMoreQuizzes.value = fetchedQuizzes.length === limitQuizzes;

    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      loadingQuizzes.value = false;
    }
  };

  // Fungsi untuk mengambil data lessons berdasarkan skip dan limit
  const fetchLessons = async () => {
    if (loadingLessons.value) return;
    loadingLessons.value = true;

    try {
      const res = await axios.get(`${api.API_BASE_URL}/lessons`, {
        headers: { Authorization: ` ${accessToken}` },
        params: { 
          created_by: instructorId, // Filter berdasarkan instructor_id
          is_deleted: 0,
          $skip: skipLessons.value, 
          $limit: limitLessons
        }
      });

      const fetchedLessons = res.data.data || [];

      if (fetchedLessons.length > 0) {
        lessons.value.push(...fetchedLessons);
      }

      hasMoreLessons.value = fetchedLessons.length === limitLessons;

    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      loadingLessons.value = false;
    }
  };

  // Fungsi untuk menangani tombol "Load More" untuk kursus
  const loadMoreCourses = () => {
    if (!loadingCourses.value && hasMoreCourses.value) {
      skipCourses.value += limitCourses;
      fetchCourses();
    }
  };

  // Fungsi untuk menangani tombol "Load More" untuk quiz
  const loadMoreQuizzes = () => {
    if (!loadingQuizzes.value && hasMoreQuizzes.value) {
      skipQuizzes.value += limitQuizzes;
      fetchQuizzes();
    }
  };

  // Fungsi untuk menangani tombol "Load More" untuk lessons
  const loadMoreLessons = () => {
    if (!loadingLessons.value && hasMoreLessons.value) {
      skipLessons.value += limitLessons;
      fetchLessons();
    }
  };
  
  const onAddModule = () => {
    router.push('/module-form');
  };

  const onAddQuiz = () => {
    router.push('/quiz-form');
  };

  const onAddLesson = () => {
    router.push('/lesson-form');
  };
  
  const editCourse = (course) => {
    router.push(`/module-form/${course.id}`);
  };
  
  const deleteCourse = (course) => {
    console.log('Delete course:', course);
  };

  const editQuiz = (quiz) => {
    router.push(`/quiz-form/${quiz.id}`);
  };
  
  const deleteQuiz = (quiz) => {
    console.log('Delete quiz:', quiz);
  };

  const editLesson = (lesson) => {
    router.push(`/lesson-form/${lesson.id}`);
  };

  const deleteLesson = (lesson) => {
    $q.dialog({
      title: 'Konfirmasi',
      message: 'Apakah anda yakin akan menghapus Pelatihan ini?',
      ok: {
        label: 'Ya',
        color: 'primary'
      },
      cancel: {
        label: 'Kembali',
        color: 'red'
      }
    }).onOk(async () => {
      const payload = {
        is_deleted : 1
      }
      
      await axios.patch(`${api.API_BASE_URL}/lessons/${lesson.id}`, payload, {
        headers: { Authorization: ` ${localStorage.getItem('token')}` }
      })

      $q.dialog({
        title: 'Berhasil',
        message: 'Pelatihan berhasil dihapus',
        ok: {
          label: 'OK',
          color: 'primary'
        }
      }).onOk(() => {
        location.reload()
      })

    }).onCancel(() => {
      console.log('Cancel Delete lesson:')
    })
  }

</script>

<style scoped>
  .ellipsis-text {
    white-space: nowrap;        /* Mencegah teks membungkus */
    overflow: hidden;           /* Menyembunyikan teks yang terpotong */
    text-overflow: ellipsis;    /* Menambahkan "..." di akhir teks */
  }
</style>
