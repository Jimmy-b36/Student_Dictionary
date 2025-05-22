import Table from '@/components/table/DictionaryTable.vue';
import { useTableStore } from '@/stores/tableStore';
import { createTestingPinia } from '@pinia/testing';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import ToastService from 'primevue/toastservice';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mock dependencies ---
const mockReorderTags = vi.fn();
vi.mock('@/composables/dictionary.service', () => ({
  useDictionaryService: vi.fn(() => ({
    reorderTags: mockReorderTags,
  })),
}));

// Mock PocketBase
const mockIsSuper = vi.fn().mockReturnValue(false);
vi.mock('@/utils/pocketbaseConnection', () => ({
  pb: {
    authStore: {
      get model() {
        return { isSuper: mockIsSuper() };
      },
    },
  },
}));

const fetchNextPagesSpy = vi.fn();
vi.mock('@/stores/tableStore', () => ({
  useTableStore: vi.fn(() => ({
    fetchNextPages: fetchNextPagesSpy,
  })),
}));

// --- Mock PrimeVue Components ---
const DataTable = {
  template: '<div><slot></slot><slot name="empty"></slot></div>',
  props: [
    'value',
    'paginator',
    'rows',
    'tableStyle',
    'rowsPerPageOptions',
    'showGridlines',
    'loading',
  ],
  emits: ['page'],
};

const Column = {
  template: '<div><slot></slot><slot name="body" :data="mockData"></slot></div>',
  props: ['field', 'header', 'center', 'headerStyle'],
  setup() {
    return {
      mockData: {
        id: '1',
        word: 'test',
        phonemes: [
          { id: '1', phoneme: 'ph1' },
          { id: '2', phoneme: 'ph2' },
        ],
        phonograms: [
          { id: '1', phonogram: 'pg1' },
          { id: '2', phonogram: 'pg2' },
        ],
      },
    };
  },
};

const Tag = {
  template: '<div><slot name="icon"></slot></div>',
  props: ['severity', 'rounded'],
};

const mockAddTagModal = vi.fn();
const AddTagModal = {
  template: '<div></div>',
  props: ['word', 'wordId', 'isPhoneme', 'isAdmin'],
  setup(props: any) {
    mockAddTagModal(props);
    return {};
  },
};

const mockRemoveTagModal = vi.fn();
const RemoveTagModal = {
  template: '<div></div>',
  props: ['word', 'wordId', 'tag', 'tagId', 'isPhoneme', 'isAdmin'],
  setup(props: any) {
    mockRemoveTagModal(props);
    return {};
  },
};

const mockAddToStudentDictionary = vi.fn();
const AddToStudentDictionary = {
  template: '<div></div>',
  props: ['word'],
  setup(props: any) {
    mockAddToStudentDictionary(props);
    return {};
  },
};

// Mock draggable component
const mockDraggable = vi.fn();
vi.mock('vuedraggable', () => ({
  default: {
    template: '<div><slot name="item" :element="element"></slot></div>',
    props: ['modelValue', 'itemKey', 'group', 'disabled'],
    setup(props: any) {
      mockDraggable(props);
      return {
        element: props.modelValue?.[0] || { id: 999, phoneme: 'mock', phonogram: 'mock' },
      };
    },
    emits: ['update:modelValue', 'change', 'start', 'end'],
  },
}));

describe('Table.vue', () => {
  let wrapper: VueWrapper<any>;
  const mockTableStore = {
    tableData: [
      {
        id: '1',
        word: 'test',
        phonemes: [
          { id: '1', phoneme: 'ph1' },
          { id: '2', phoneme: 'ph2' },
        ],
        phonograms: [
          { id: '1', phonogram: 'pg1' },
          { id: '2', phonogram: 'pg2' },
        ],
      },
    ],
    fetchNextPages: vi.fn(),
  };

  const mockSearchStore = {
    hasActiveFilters: false,
  };

  const createWrapper = (loading = false) => {
    wrapper = shallowMount(Table, {
      props: {
        loading,
      },
      global: {
        plugins: [
          ToastService,
          createTestingPinia({
            initialState: {
              tableStore: mockTableStore,
              searchStore: mockSearchStore,
            },
            createSpy: vi.fn,
          }),
        ],
        stubs: {
          DataTable,
          Column,
          Tag,
          AddTagModal,
          RemoveTagModal,
          AddToStudentDictionary,
          'transition-group': true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchNextPagesSpy.mockClear();
  });

  it('renders the table with correct props', () => {
    createWrapper();
    const dataTable = wrapper.findComponent(DataTable);
    expect(dataTable.exists()).toBe(true);
    expect(dataTable.props('rows')).toBe(10);
    expect(dataTable.props('loading')).toBe(false);
  });

  it('displays empty state message when no data', async () => {
    // Update the mock tableData to be empty
    mockTableStore.tableData = [];
    createWrapper();

    expect(wrapper.text()).toContain('No results found.');
  });

  it('passes isAdmin=false to child components when user is not admin', () => {
    mockIsSuper.mockReturnValue(false);
    createWrapper(false);
    expect(wrapper.vm.isAdmin).toBe(false);

    // Check the AddTagModal which is directly rendered
    expect(mockAddTagModal.mock.calls[0][0].isAdmin).toBe(false);
  });

  it('passes isAdmin=true to child components when user is admin', () => {
    mockIsSuper.mockReturnValue(true);
    createWrapper(true);
    expect(wrapper.vm.isAdmin).toBe(true);

    // Check the AddTagModal which is directly rendered
    expect(mockAddTagModal.mock.calls[0][0].isAdmin).toBe(true);
  });

  it('calls handleReorder when draggable emits change event', async () => {
    mockIsSuper.mockReturnValue(true);
    createWrapper(true);
    mockReorderTags.mockResolvedValueOnce({});

    await wrapper.vm.handleReorder([{ id: 1, phoneme: 'test' }], 'test', 1, true);

    expect(mockReorderTags).toHaveBeenCalledWith('test', '1', [{ id: 1, phoneme: 'test' }], true);
  });

  it('calls fetchNextPages when the page is 3 or less than the page count', async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Get a reference to the actual mock function
    const storeInstance = useTableStore();
    fetchNextPagesSpy.mockClear();

    createWrapper(false);

    const pageEvent = {
      page: 8,
      first: 80,
      rows: 10,
      pageCount: 10,
    };

    wrapper.vm.onPageChange(pageEvent);

    // Verify fetchNextPages was called
    expect(storeInstance.fetchNextPages).toHaveBeenCalled();
  });
});
