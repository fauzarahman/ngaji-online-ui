<template>
    <q-page padding>
      <!-- Header -->
      <q-header elevated class="bg-green-gradient text-white">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
          <q-toolbar-title>{{ form.title || 'Tambah Tajwid' }}</q-toolbar-title>
        </q-toolbar>
      </q-header>
  
      <q-card class="my-card">
        <q-card-section>
          <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
            <!-- Question -->
            <q-input
              filled
              v-model="form.section_name"
              label="Tajwid"
              :rules="[val => !!val || 'Nama Tajwid wajib diisi']"
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
  import { useQuasar } from 'quasar'
  import { ref, computed, onMounted, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import axios from "axios";
  import api from "src/config/api";
  
  const $q = useQuasar()
  const router = useRouter()
  const route = useRoute()
  
  const loading = ref(false)
  const formRef = ref(null)
  const modulesOptions = ref([])
  
  const form = ref({
    id: null,
    section_name: ""
  })
  
  const isEdit = computed(() => !!form.value.id)
  const goBack = () => router.go(-1)
  const cancel = () => router.back()
  
  // Load quiz data if edit
  const fetchSectionsData = async () => {
    const id = route.params.id
    if (id) {
      loading.value = true
      try {
        const res = await axios.get(`${api.API_BASE_URL}/sections/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = res.data
        form.value.id = data.id
        form.value.section_name = data.section_name
      } catch (err) {
        console.error("Error fetching tajwid data:", err)
      } finally {
        loading.value = false
      }
    }
  }
  
  // Save quiz
  const submitForm = async () => {
    if (!formRef.value.validate()) return
  
    loading.value = true
    try {
      const payload = {
        section_name: form.value.section_name,
      }
  
      if (isEdit.value) {
        await axios.patch(`${api.API_BASE_URL}/sections/${form.value.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      } else {
        await axios.post(`${api.API_BASE_URL}/sections`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      }
  
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
      console.error("Error saving tajwid:", err)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchSectionsData()
  })
  </script>
  
  <style scoped>
  .my-card {
    max-width: 600px;
    margin: auto;
  }
  </style>
  