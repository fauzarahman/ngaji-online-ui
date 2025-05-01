<template>
  <div class="q-pa-md">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>Edit Materi</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Form Section -->
    <q-page class="q-pt-xl flex flex-center">
      <q-form @submit.prevent="submitForm" class="q-gutter-md" style="width: 100%; max-width: 500px">

        <!-- Avatar Upload -->
        <div class="flex flex-center q-mb-md">
          <q-avatar size="120px" class="bg-grey-4">
            <q-img
              :src="previewImage || 'https://cdn.quasar.dev/img/image-placeholder.png'"
              spinner-color="white"
            />
          </q-avatar>
        </div>
        <div class="text-center q-mb-md">
          <q-btn flat label="Ganti Foto" @click="pickImage" color="primary" />
        </div>

        <!-- Hidden File Input -->
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />

        <!-- Input Fields -->
        <q-input
          v-model="form.videoUrl"
          label="Url Video"
          filled
          dense
        />
        <q-input
          v-model="form.materiTitle"
          label="Judul Materi"
          filled
          dense
        />
        <q-input
          v-model="form.sectionTitle"
          label="Judul Section 1"
          filled
          dense
        />
        <q-input
          v-model="form.sectionUrl"
          label="Url Section 1"
          filled
          dense
        />

        <!-- Submit Button -->
        <q-btn label="Simpan" type="submit" color="primary" class="full-width q-mt-md" />

      </q-form>
    </q-page>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const fileInput = ref(null);

const form = ref({
  videoUrl: '',
  materiTitle: '',
  sectionTitle: '',
  sectionUrl: '',
  avatar: null
});

const previewImage = ref('');

const goBack = () => {
  router.go(-1);
};

const pickImage = () => {
  fileInput.value.click();
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.value.avatar = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const submitForm = () => {
  console.log('Data Form:', form.value);
  // Kirim form.value ke API kamu di sini
};
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
