import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'word',
    header: () => h('div', { class: 'text-right' }, 'Word'),
    cell: ({ row }) => h('div', { class: 'text-right font-medium' }, row.getValue('word'))
  },
  {
    accessorKey: 'phonemes',
    header: () => h('div', { class: 'text-right' }, 'Phonemes'),

    cell: ({ row }) => {
      const phonemes = row.getValue('phonemes')
      return h('div', { class: 'text-right' }, Array.from(phonemes).join(', '))
    }
  }
]
