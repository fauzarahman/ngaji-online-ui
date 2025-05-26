<template>
  <q-page padding>
    <q-header elevated class="bg-green-gradient text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="cancel" />
        <q-toolbar-title>{{ isEdit ? 'Edit Guru' : 'Tambah Guru' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-card class="my-card">
      <q-card-section>
        <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            filled
            dense
            input-class="text-black"
            class="q-mb-sm"
            :error="emailError"
            :error-message="emailErrorMsg"
            @blur="validateEmail"
          />
          <q-input
            v-if="!isEdit"
            v-model="form.password"
            label="Password"
            type="password"
            filled
            dense
            input-class="text-black"
            class="q-mb-sm"
          />
          <q-input
            v-model="form.display_name"
            label="Nama Tampilan"
            filled
            dense
            input-class="text-black"
            class="q-mb-sm"
          />
          <q-input
            v-model="form.jobtitle"
            label="Pekerjaan / Kegiatan Saat Ini"
            filled
            dense
            input-class="text-black"
            class="q-mb-sm"
          />

          <!-- Avatar Preview -->
          <div v-if="avatarPreview" class="q-mb-sm">
            <q-img
              :src="avatarPreview"
              style="max-width: 150px; border-radius: 8px;"
              spinner-color="white"
            />
            <q-btn
              flat
              label="Hapus Avatar"
              icon="delete"
              color="negative"
              class="q-mt-sm"
              @click="clearAvatar"
            />
          </div>

          <!-- Upload Avatar -->
          <q-uploader
            ref="uploaderRef"
            label="Upload Avatar"
            accept=".jpg, .jpeg, .png"
            :auto-upload="false"
            @added="onFileAdded"
            class="q-mb-sm"
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
import { useQuasar } from 'quasar'
import api from 'src/config/api'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const uploaderRef = ref(null)
const formRef = ref(null)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  id: null,
  email: '',
  password: '',
  display_name: '',
  jobtitle: '',
  file: null,
  avatar: ''
})

// Avatar preview
const avatarPreview = computed(() => {
  if (form.value.avatar) return `${api.API_UPLOADS_URL}/${form.value.avatar}`
  return null
})

const clearAvatar = () => {
  form.value.file = null
  form.value.avatar = ''
}

const onFileAdded = (files) => {
  form.value.file = files[0]
}

// Email unik (frontend-only)
const emailError = ref(false)
const emailErrorMsg = ref('')

const checkEmailExists = async (email) => {
  try {
    const res = await fetch(`${api.API_BASE_URL}/users?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const data = await res.json()
    return Array.isArray(data.data) && data.data.length > 0
  } catch (err) {
    console.error('Gagal cek email:', err)
    return false
  }
}

const validateEmail = async () => {
  if (!form.value.email || isEdit.value) return
  const exists = await checkEmailExists(form.value.email)
  emailError.value = exists
  emailErrorMsg.value = exists ? 'Email sudah digunakan' : ''
}

// Submit form
const submitForm = async () => {
  if (!formRef.value.validate()) return

  loading.value = true

  if (!isEdit.value) {
    const exists = await checkEmailExists(form.value.email)
    if (exists) {
      emailError.value = true
      emailErrorMsg.value = 'Email sudah digunakan'
      loading.value = false
      return
    }
  }

  try {
    let userId = form.value.id

    if (!isEdit.value) {
      const userRes = await fetch(`${api.API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.value.email,
          password: form.value.password,
          role: 'guru'
        })
      })
      const user = await userRes.json()
      userId = user.id
    }

    let uploadedAvatar = form.value.avatar
    if (form.value.file) {
      const formData = new FormData()
      formData.append('file', form.value.file)

      const uploadRes = await fetch(`${api.API_BASE_URL}/uploads`, {
        method: 'POST',
        body: formData
      })
      const upload = await uploadRes.json()
      uploadedAvatar = upload.filename
    }

    const profilePayload = {
      user_id: userId,
      display_name: form.value.display_name,
      jobtitle: form.value.jobtitle,
      avatar: uploadedAvatar
    }

    if (isEdit.value) {
      await fetch(`${api.API_BASE_URL}/profiles/${form.value.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(profilePayload)
      })
    } else {
      await fetch(`${api.API_BASE_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(profilePayload)
      })
    }

    // ✅ Dialog sukses dan redirect setelah klik OK
    $q.dialog({
      title: 'Berhasil',
      message: 'Data berhasil disimpan.',
      ok: {
        label: 'OK',
        color: 'primary'
      }
    }).onOk(() => {
      router.back()
    })

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan data guru.' })
  } finally {
    loading.value = false
  }
}


// Load data saat edit
onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const res = await fetch(`${api.API_BASE_URL}/profiles/${id}`)
      const data = await res.json()
      form.value.id = data.id
      form.value.email = data.user?.email || ''
      form.value.display_name = data.display_name
      form.value.jobtitle = data.jobtitle
      form.value.avatar = data.avatar || ''
    } catch (err) {
      console.error('Gagal mengambil data guru:', err)
    }
  }
})

const cancel = () => {
  router.back()
}
</script>

<style scoped>
.my-card {
  max-width: 600px;
  margin: auto;
}
.q-uploader {
  width: 95% !important;
}
.q-uploader__header {
  background-color: #526659;
}
</style>
