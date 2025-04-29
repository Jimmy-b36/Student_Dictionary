<template>
  <Button
    label="View Terms of Service"
    icon="pi pi-file-text"
    @click="isVisible = true"
    variant="text"
    class="p-button-text p-button-sm text-indigo-600 !p-0 !bg-transparent"
  />
  <Dialog
    :visible="isVisible"
    :modal="true"
    :style="{ width: '500px' }"
    header="Terms of Service"
    :closable="false"
  >
    <div class="p-fluid">
      <div
        class="mb-4 max-h-72 overflow-y-auto text-sm text-gray-700 whitespace-pre-line border p-3 rounded bg-gray-50"
      >
        <slot>
          <h4 class="font-bold mb-2">Student Dictionary Terms of Service</h4>

          <p class="mb-2"><strong>Privacy & Student Protection</strong></p>
          <p class="mb-2">
            1. <strong>NO PERSONAL IDENTIFIERS:</strong> You must NEVER use real student names,
            photos, or any personally identifiable information (PII) when creating student profiles.
            Use nicknames, codes, or other non-identifying labels only.
          </p>
          <p class="mb-2">
            2. <strong>Data Minimization:</strong> Only collect and store information that is
            absolutely necessary for educational purposes. Avoid collecting sensitive personal
            information, contact details, or demographic data.
          </p>
          <p class="mb-2">
            3. <strong>Parental/Guardian Consent:</strong> You affirm that you have proper
            authorization to use this tool for educational purposes with your students.
          </p>

          <p class="mb-2"><strong>Acceptable Use</strong></p>
          <p class="mb-2">
            4. <strong>Educational Purpose Only:</strong> This application is to be used solely for
            educational purposes to track vocabulary development. It should not be used for
            behavioral tracking, assessment grading, or any non-educational purpose.
          </p>
          <p class="mb-2">
            5. <strong>No Sharing:</strong> Do not share student data with third parties or use it
            for any purpose beyond direct educational support within your teaching context.
          </p>

          <p class="mb-2"><strong>Security & Compliance</strong></p>
          <p class="mb-2">
            6. <strong>Account Security:</strong> You are responsible for maintaining the security
            of your account credentials and preventing unauthorized access.
          </p>
          <p class="mb-2">
            7. <strong>Violations:</strong> Accounts found to contain real student names or PII will
            be suspended or terminated without notice.
          </p>
          <p class="mb-2">
            8. <strong>Data Removal:</strong> You may request deletion of student data at any time.
          </p>

          <p class="mt-3">
            By accepting these terms, you commit to protecting student privacy and using this
            application for its intended educational purpose only.
          </p>
        </slot>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="isVisible = false"
          class="p-button-outlined !bg-red-400 !text-white !border-none"
        />
        <Button label="Accept" icon="pi pi-check" @click="handleAccept" class="p-button-primary" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isVisible = ref(false)
const tosAccepted = ref(false)

const handleAccept = () => {
  tosAccepted.value = true
  isVisible.value = false
}

// Export tosAccepted to be used by parent components
defineExpose({ tosAccepted })
</script>

<style scoped>
/* Optional: add more custom styles if you want */
</style>
