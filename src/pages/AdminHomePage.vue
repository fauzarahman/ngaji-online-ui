<template>
  <div class="q-pa-md">
    <!-- Welcome -->
    <div class="row items-center hp-profil-header q-mb-md">
      <div class="col">
        <h5 class="text-bold">
          Welcome <span class="text-primary">{{ profile.display_name || 'Guest' }}</span>
        </h5>
      </div>
      <q-btn flat dense round icon="notifications" class="q-mr-sm" />
    </div>

    <!-- Guru Header -->
    <div class="row items-center justify-between q-mb-md">
      <h6 class="text-bold">Daftar Guru</h6>
      <q-btn label="Tambah Guru" color="green" flat rounded dense @click="onAddGuru" />
    </div>

    <!-- List Guru -->
    <div class="q-gutter-md">
      <q-item
        v-for="guru in gurus"
        :key="guru.id"
        class="q-mb-md"
        clickable
        @click="editGuru(guru)"
        bordered
      >
        <q-item-section>
          <q-item-label class="text-h6 text-weight-medium">{{ guru.email }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round size="xs" icon="more_vert" @click.stop>
            <q-menu auto-close>
              <q-list style="min-width: 100px;">
                <q-item clickable @click="editGuru(guru)">
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable @click="deleteCourse(guru)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
    </div>

    <q-btn
      label="Tampilkan lebih banyak"
      flat
      class="full-width q-mt-md"
      @click="loadMoreCourses"
      :loading="loadingGuru"
      :disable="loadingGuru || !hasMoreGuru"
    />

    <!-- Riwayat Donasi -->
    <div>
      <div class="row items-center justify-between">
        <h6 class="text-bold">Riwayat Donasi</h6>
      </div>

      <q-list bordered separator style="margin-top: -20px;">
        <q-item v-for="donation in donations" :key="donation.id" class="q-mb-sm">
          <q-item-section avatar>
            <q-avatar rounded size="56px">
              <q-img :src="`${API_UPLOADS_URL}/${donation.proof_image}`" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">{{ donation.account_name }}</q-item-label>
            <q-item-label caption class="text-grey">
              {{ donation.bank_name }} - {{ donation.source_bank }}
            </q-item-label>
            <q-item-label caption class="text-primary">
              Rp {{ Number(donation.amount).toLocaleString('id-ID') }}
            </q-item-label>
            <q-item-label caption>
              {{ formatDate(donation.created_at) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round icon="visibility" @click="viewDonation(donation)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
  
<script setup>
  import { useQuasar } from 'quasar'
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import api from 'src/config/api'
  
  const $q = useQuasar()
  const router = useRouter()
  
  const profile = ref({})
  const gurus = ref([])
  const donations = ref([])
  
  const accessToken = localStorage.getItem('token')
  const API_UPLOADS_URL = api.API_UPLOADS_URL
  
  const skipGurus = ref(0)
  const limitGurus = 10
  const loadingGuru = ref(false)
  const hasMoreGuru = ref(true)
  
  // Fetch profile + guru + donasi
  onMounted(async () => {
    const profileData = localStorage.getItem('profile')
    if (profileData) {
      try {
        profile.value = JSON.parse(profileData)
      } catch (e) {
        console.error('Error parsing profile from localStorage', e)
      }
    }
  
    await fetchGuru()
    await fetchDonations()
  })
  
  // Fetch Guru
  const fetchGuru = async () => {
    if (loadingGuru.value) return
    loadingGuru.value = true
  
    try {
      const res = await axios.get(`${api.API_BASE_URL}/users`, {
        headers: { Authorization: ` ${accessToken}` },
        params: {
          role: 'guru',
          $skip: skipGurus.value,
          $limit: limitGurus
        }
      })
  
      const fetchedGuru = res.data.data || []
      if (fetchedGuru.length > 0) {
        gurus.value.push(...fetchedGuru)
      }
  
      hasMoreGuru.value = fetchedGuru.length === limitGurus
    } catch (err) {
      console.error('Failed to fetch gurus:', err)
    } finally {
      loadingGuru.value = false
    }
  }
  
  const loadMoreCourses = () => {
    if (!loadingGuru.value && hasMoreGuru.value) {
      skipGurus.value += limitGurus
      fetchGuru()
    }
  }
  
  // Fetch Donasi
  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${api.API_BASE_URL}/donations?`, {
        headers: { Authorization: ` ${accessToken}` },
        params: {
          $sort: {
            created_at: -1 // urutkan dari terbaru ke terlama
          }
        }
      })
      donations.value = res.data.data || res.data
    } catch (err) {
      console.error('Gagal mengambil donasi:', err)
    }
  }
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const viewDonation = (donation) => {
  $q.dialog({
    title: 'Detail Donasi',
    message: `
      <div>
        <strong>Nama:</strong> ${donation.account_name}<br>
        <strong>Bank:</strong> ${donation.bank_name}<br>
        <strong>Rekening:</strong> ${donation.source_bank}<br>
        <strong>Nominal:</strong> Rp ${Number(donation.amount).toLocaleString('id-ID')}<br>
        <br>
        <img
          src="${API_UPLOADS_URL}/${donation.proof_image}"
          alt="Bukti Transfer"
          style="max-width: 100%; border-radius: 8px;"
        />
      </div>
    `,
    html: true,
    ok: {
      label: 'Tutup',
      color: 'primary'
    }
  })
}

  
  // Actions
  const onAddGuru = () => router.push('/user-form')
  const editGuru = (guru) => router.push(`/user-form/${guru.id}`)
  const deleteCourse = (guru) => {
    console.log('Delete guru:', guru)
  }
</script>
  
<style scoped>
  .my-card {
    max-width: 700px;
    margin: auto;
  }
  .q-item-label {
    line-height: 1.2;
  }
</style>
  