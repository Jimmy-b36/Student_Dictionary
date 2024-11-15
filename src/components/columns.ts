import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

interface TableRow {
  id: string
  word: string
  phonemes: string[]
}

export const columns: ColumnDef<TableRow>[] = [
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
      return h('div', { class: 'text-right' }, phonemes.join(', '))
    }
  }
]
