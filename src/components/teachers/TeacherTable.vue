<template>
  <div class="flex w-full justify-center">
    <div class="card p-5">
      <h2 class="text-center mb-5 text-2xl font-bold text-primary">Your Students</h2>

      <div v-if="loading" class="flex justify-center my-8">
        <ProgressSpinner />
      </div>

      <DataTable
        v-else
        :value="students"
        tableStyle="min-width: 50rem"
        class="mb-4"
        stripedRows
        showGridlines
        paginator
        :rows="10"
        responsiveLayout="scroll"
        emptyMessage="No students found"
      >
        <Column field="unique_id" header="ID"></Column>
        <Column field="display_name" header="Display Name"></Column>
        <Column field="created" header="Created"></Column>
        <Column header="Actions" style="width: 20%">
          <template #body="{ data }">
            <div class="flex gap-2 justify-center">
              <DeleteStudentModal :student="data" @deleted="refreshStudents" />
              <EditStudentModal :student="data" @updated="refreshStudents" />
              <a :href="`/home/student/${data.id}`">
                <Button
                  icon="pi pi-book"
                  class="p-button-success p-button-rounded p-button-sm"
                  v-tooltip.top="'View Dictionary'"
                />
              </a>
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-end">
        <AddStudentModal @create="refreshStudents" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useStudentService } from '@/composables/student.service'
import { useStudentStore } from '@/stores/student.store'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import AddStudentModal from './AddStudentModal.vue'
import DeleteStudentModal from './DeleteStudentModal.vue'
import EditStudentModal from './EditStudentModal.vue'

const studentStore = useStudentStore()
const studentService = useStudentService()
const { students, loading } = storeToRefs(studentStore)

const refreshStudents = async () => {
  await studentService.fetchStudents(true) // force refresh
}

onMounted(refreshStudents)
</script>
<style lang="scss" scoped></style>
