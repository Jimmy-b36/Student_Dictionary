// stores/tableStore.ts
import { useDictionaryStore } from '@/stores/dictionary'
import type { ColumnDef } from '@tanstack/vue-table'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
  type TableOptions
} from '@tanstack/vue-table'
import { defineStore, storeToRefs } from 'pinia'
import { computed, h, ref, watch } from 'vue'

interface TableData {
  word: string
  phonemes: string[]
  phonograms: string[]
}

interface TableRow {
  id: string
  word: string
  phonemes: string[]
}

export const useTableStore = defineStore('table', () => {
  const { dictionary } = storeToRefs(useDictionaryStore())
  const totalRows = ref(0)
  const isLoading = ref(false)
  const pagination = ref({
    pageIndex: 0,
    pageSize: 10
  })

  const tableData = computed(() => {
    return Array.from(dictionary.value, ([key, data]) => ({
      id: key,
      word: key,
      phonemes: Array.from(data.phonemes),
      phonograms: Array.from(data.phonograms)
    }))
  })

  watch(tableData, (newVal) => {
    console.log('🔥 tableData', newVal)
    totalRows.value = newVal.length
  })

  const columns = ref<ColumnDef<TableRow>[]>([
    {
      accessorKey: 'word',
      header: () => h('div', { class: 'text-right' }, 'Word'),
      cell: ({ row }) => h('div', { class: 'text-right font-medium' }, row.getValue('word'))
    },
    {
      accessorKey: 'phonemes',
      header: () => h('div', { class: 'text-right' }, 'Phonemes'),
      cell: ({ row }) => {
        const phonemes = row.getValue('phonemes') as string[]
        if (!phonemes || phonemes.length === 0) {
          return h('div', { class: 'text-right' }, 'N/A')
        }
        return h('div', { class: 'text-right' }, phonemes.join(', '))
      }
    },
    {
      accessorKey: 'phonograms',
      header: () => h('div', { class: 'text-right' }, 'Phonograms'),
      cell: ({ row }) => {
        const phonograms = row.getValue('phonograms') as string[]
        if (!phonograms || phonograms.length === 0) {
          return h('div', { class: 'text-right' }, 'N/A')
        }
        return h('div', { class: 'text-right' }, phonograms.join(', '))
      }
    }
  ])

  const table = useVueTable({
    get data() {
      return tableData.value
    },
    get columns() {
      return columns.value
    },
    pageCount: Math.ceil(totalRows.value / pagination.value.pageSize),
    state: {
      pagination: pagination.value
    },
    onPaginationChange: (updater: any) => {
      pagination.value = updater(pagination.value)
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel()
  } as TableOptions<TableData>)

  // Computed properties for pagination
  const totalPages = computed(() => table.getPageCount())
  const canPreviousPage = computed(() => table.getCanPreviousPage())
  const canNextPage = computed(() => table.getCanNextPage())

  return {
    table,
    pagination,
    totalPages,
    canPreviousPage,
    canNextPage,
    columns
  }
})
