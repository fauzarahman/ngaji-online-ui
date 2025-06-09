<template>
    <q-page padding class="bg-white">
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
        <h6 class="text-bold">Daftar Hukum Tawjid</h6>
        <q-btn label="Tambah Hukum Tajwid" color="green" flat rounded dense @click="onAddTajwid" />
      </div>
  
      <!-- Course List as a List (using q-item) -->
      <div class="q-gutter-md">
        <q-item
          v-for="tajwid in sections"
          :key="tajwid.id"
          class="q-mb-md"
          clickable
          @click="editTajwid(tajwid)"
          bordered
        >
          <q-item-section>
            <q-item-label class="text-h6 text-weight-medium">{{ tajwid.section_name }}</q-item-label>
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
                  <q-item clickable @click="editTajwid(tajwid)">
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteTajwid(tajwid)">
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
        :loading="loadingGuru"
        :disable="loadingGuru || !hasMoreGuru"
      />
    </q-page>
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
    const sections = ref([]);
    const quizzes = ref([]);
    const lessons = ref([]);
    const accessToken = localStorage.getItem('token');
    const instructorId = localStorage.getItem('id');
    
    // Paging for Courses
    const skipGurus = ref(0);
    const limitGurus = 10;
    const loadingGuru = ref(false);
    const hasMoreGuru = ref(true);
  
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
      await fetchSection();
    });
    
    // Fungsi untuk mengambil data kursus berdasarkan skip dan limit
    const fetchSection = async () => {
      if (loadingGuru.value) return;
      loadingGuru.value = true;
    
      try {
        const res = await axios.get(`${api.API_BASE_URL}/sections`, {
          headers: { Authorization: ` ${accessToken}` },
        });
        
        const fetchedGuru = res.data.data || [];
        
        if (fetchedGuru.length > 0) {
          sections.value.push(...fetchedGuru);
        }
    
        hasMoreGuru.value = fetchedGuru.length === limitGurus;
    
      } catch (err) {
        console.error('Failed to fetch sections:', err);
      } finally {
        loadingGuru.value = false;
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
      if (!loadingGuru.value && hasMoreGuru.value) {
        skipGurus.value += limitGurus;
        fetchSection();
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
    
    const onAddTajwid = () => {
      router.push('/tajwid-form');
    };
  
    const onAddQuiz = () => {
      router.push('/quiz-form');
    };
  
    const onAddLesson = () => {
      router.push('/lesson-form');
    };
    
    const editTajwid = (tajwid) => {
      router.push(`/tajwid-form/${tajwid.id}`);
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
  
    const deleteTajwid = (section) => {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah anda yakin akan menghapus Hukum Tajwid ini ?',
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
        
        await axios.delete(`${api.API_BASE_URL}/sections/${section.id}`, {
          headers: { Authorization: ` ${localStorage.getItem('token')}` }
        })
  
        $q.dialog({
          title: 'Berhasil',
          message: 'Hukum Tajwid berhasil dihapus',
          ok: {
            label: 'OK',
            color: 'primary'
          }
        }).onOk(() => {
          location.reload()
        })
  
      }).onCancel(() => {
        console.log('Cancel Delete Tajwid:')
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
  