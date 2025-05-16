<template>
  <q-page padding>
    <!-- Header -->
    <q-header elevated class="bg-green-gradient text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ form.title || 'Tambah Modul' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="my-card">
      <q-card-section>
        <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
          <q-input
            filled
            v-model="form.title"
            label="Judul Materi"
            :rules="[val => !!val || 'Judul wajib diisi']"
          />

          <q-select
            filled
            v-model="form.section_id"
            :options="sectionsOptions"
            label="Section"
            option-label="section_name"
            option-value="id"
            :rules="[val => val !== null && val !== undefined || 'Section wajib dipilih']"
            emit-value
            map-options
          />

          <q-input
            filled
            type="textarea"
            v-model="form.description"
            label="Deskripsi"
            placeholder="Opsional"
            autogrow
          />

          <q-input
            filled
            v-model="form.video_header_id"
            label="Video Header"
            placeholder="Opsional"
          />

          <!-- Upload Thumbnail -->
          <q-uploader
            filled
            style="padding-right: 15px;"
            v-model="form.thumbnailFile"
            label="Thumbnail Image"
            accept="image/*"
            @added="onThumbnailFileChange"
            :rules="[val => !!val || 'Thumbnail wajib dipilih']"
          />

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Batal" color="grey" flat @click="cancel" />
            <q-btn type="submit" :label="isEdit ? 'Update' : 'Tambah'" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import api from 'src/config/api'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const formRef = ref(null)
const sectionsOptions = ref([])

const form = ref({
  id: null,
  title: '',
  description: '',
  video_header_id: '',
  thumbnail: '',
  thumbnailFile: null, // For the file input
  section_id: null,
  instructor_id: localStorage.getItem('id') || null,
})

const goBack = () => {
  router.go(-1);
};

const isEdit = computed(() => !!form.value.id)

// Function to handle thumbnail file change
const onThumbnailFileChange = (file) => {
  form.value.thumbnailFile = file[0]; // Get the first file from the array
};

// Function to handle file upload and get image URL
const uploadThumbnail = async () => {
  const formData = new FormData();
  formData.append("file", form.value.thumbnailFile);

  try {
    const response = await axios.post(`${api.API_BASE_URL}/upload-thumbnail`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: ` ${localStorage.getItem('token')}`,
      }
    });

    // Assuming the server returns the URL of the uploaded image
    form.value.thumbnail = response.data.fileUrl;
  } catch (error) {
    console.error("Failed to upload thumbnail:", error);
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/sections`, {
      headers: { Authorization: ` ${localStorage.getItem('token')}` }
    })
    sectionsOptions.value = res.data.data // asumsikan API return array of {id, section_name}
  } catch (error) {
    console.error('Gagal ambil sections:', error)
  }

  // Jika ada param id, fetch data module untuk edit
  const id = route.params.id
  if (id) {
    try {
      const res = await axios.get(`${api.API_BASE_URL}/modules/${id}`, {
        headers: { Authorization: ` ${localStorage.getItem('token')}` }
      })
      console.log("Module data loaded:", res.data);
      const data = res.data
      form.value.id = data.id
      form.value.title = data.title
      form.value.description = data.description
      form.value.video_header_id = data.video_header_id || ''
      form.value.thumbnail = data.thumbnail || ''
      form.value.section_id = data.section_id
      form.value.instructor_id = data.instructor_id || form.value.instructor_id
    } catch (error) {
      console.error('Gagal ambil data materi:', error)
    }
  }
})

const submitForm = async () => {
  if (!formRef.value.validate()) return

  loading.value = true
  try {
    if (form.value.thumbnailFile) {
      await uploadThumbnail(); // Upload the thumbnail before submitting the form
    }

    const payload = {
      title: form.value.title,
      description: form.value.description || null,
      video_header_id: form.value.video_header_id || null,
      thumbnail: form.value.thumbnail || null,
      section_id: form.value.section_id,
      instructor_id: form.value.instructor_id,
    }

    if (isEdit.value) {
      await axios.patch(`${api.API_BASE_URL}/modules/${form.value.id}`, payload, {
        headers: { Authorization: ` ${localStorage.getItem('token')}` }
      })
    } else {
      await axios.post(`${api.API_BASE_URL}/modules`, payload, {
        headers: { Authorization: ` ${localStorage.getItem('token')}` }
      })
    }

    router.back()
  } catch (error) {
    console.error('Gagal simpan materi:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.back()
}
</script>

<style scoped>
.my-card {
  max-width: 600px;
  margin: auto;
}
</style>
