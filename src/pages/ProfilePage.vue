<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Profil Saya</div>

        <q-form @submit.prevent="submitProfile" ref="formRef" class="q-gutter-md q-mt-md">
          <!-- Avatar Preview -->
          <div class="text-center">
            <q-avatar size="100px" rounded>
              <q-img :src="avatarPreview" />
            </q-avatar>
            <div class="q-mt-sm">
              <q-uploader
                flat
                bordered
                accept="image/*"
                label="Ubah Avatar"
                :auto-upload="false"
                @added="onAvatarChange"
                style="max-width: 300px; margin: auto"
              />
            </div>
          </div>

          <!-- Profile Fields -->
          <q-input v-model="form.display_name" label="Nama Lengkap" filled />
          <q-input v-model="form.jobtitle" label="Pekerjaan / Kegiatan" filled />
          <q-input v-model="form.tagline" label="Tagline (Opsional)" filled />
          <q-input v-model="form.about_me" label="Tentang Saya" filled type="textarea" />
          <q-input v-model="form.skills" label="Keahlian (pisahkan dengan koma)" filled />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Simpan Perubahan" color="primary" :loading="loading" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import api from 'src/config/api'

const $q = useQuasar()
const API_BASE_URL = api.API_BASE_URL
const API_UPLOADS_URL = api.API_UPLOADS_URL

const userId = localStorage.getItem('id')
const accessToken = localStorage.getItem('token')

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  id: null,
  user_id: Number(userId),
  display_name: "",
  jobtitle: "",
  tagline: "",
  about_me: "",
  skills: "",
  avatar: "",
  avatarFile: null
})

const avatarPreview = ref('https://placehold.co/300x300')

const onAvatarChange = (files) => {
  form.value.avatarFile = files[0]
  avatarPreview.value = URL.createObjectURL(files[0])
}

const loadProfile = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/profiles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { user_id: userId }
    })

    const profile = res.data.data?.[0] || res.data[0]
    if (profile) {
      form.value = {
        ...form.value,
        ...profile,
        avatarFile: null
      }

      avatarPreview.value = profile.avatar
        ? `${API_UPLOADS_URL}/${profile.avatar}`
        : 'https://placehold.co/300x300'
    }
  } catch (err) {
    console.error('Gagal memuat profil:', err)
    $q.notify({ type: 'negative', message: 'Gagal memuat profil' })
  }
}

const submitProfile = async () => {
  if (!formRef.value.validate()) return
  loading.value = true

  try {
    let avatarFilename = form.value.avatar

    if (form.value.avatarFile) {
      const formData = new FormData()
      formData.append('file', form.value.avatarFile)

      const uploadRes = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${accessToken}`
        }
      })

      avatarFilename = uploadRes.data.filename
    }

    const payload = {
      display_name: form.value.display_name || "",
      jobtitle: form.value.jobtitle || "",
      tagline: form.value.tagline || "",
      about_me: form.value.about_me || "",
      skills: form.value.skills || "",
      avatar: avatarFilename
    }

    await axios.patch(`${API_BASE_URL}/profiles/${form.value.id}`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    $q.dialog({
      title: 'Berhasil',
      message: 'Profil berhasil diperbarui.',
      ok: {
        label: 'OK',
        color: 'primary'
      }
    }).onOk(() => {
      location.reload()
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal memperbarui profil' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.my-card {
  max-width: 600px;
  margin: auto;
}
</style>
  