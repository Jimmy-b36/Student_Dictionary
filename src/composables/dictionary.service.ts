import { useSearchStore } from '@/stores/searchStore';

import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useDictionaryStore } from '../stores/dictionary';
import { pb } from '../utils/pocketbaseConnection';

const DEBOUNCE_TIMEOUT = 200;

export const useDictionaryService = () => {
  const { dictionary, phonemes, phonograms, loading } = storeToRefs(useDictionaryStore());
  const { searchState } = storeToRefs(useSearchStore());
  const initialItemsCache = ref<Map<string, IDictionaryEntry>>(new Map());

  // -------------------
  // Helper Functions
  // -------------------
  const parseViewResponse = (response: IDictionaryResponse): IDictionaryEntry => {
    return {
      wordId: response.id,
      phonemes: new Set(response.phonemes),
      phonograms: new Set(response.phonograms),
    };
  };

  // -------------------
  // InitialLoad
  // -------------------
  const initialPageLoad = async () => {
    loading.value = true;
    try {
      await Promise.all([fetchAllPhonograms(), fetchAllPhonemes(), getDictionaryPage()]);
      return true;
    } catch (error) {
      console.error('🔥 Error during initial page load:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // -------------------
  // Fetch functions
  // -------------------
  const getDictionaryPage = async (currentPage = 1, pageSize = 100) => {
    try {
      const response = await pb
        .collection('words_with_relations')
        .getList<IDictionaryResponse>(currentPage, pageSize, {
          skipTotal: true,
          requestKey: null, // Disable auto-cancellation
        });

      if (currentPage === 1) {
        initialItemsCache.value.clear();
        dictionary.value.clear();
      }

      response.items.forEach((item) => {
        const entry = parseViewResponse(item);
        dictionary.value.set(item.word, entry);

        if (currentPage === 1) {
          initialItemsCache.value.set(item.word, entry);
        }
      });
    } catch (error) {
      console.log('🥶 Error fetching dictionary page:', error);
      throw new Error('Failed to fetch dictionary page');
    }
  };

  const fetchAllPhonemes = async () => {
    if (phonemes.value.length > 0) return;
    try {
      const response = await pb
        .collection('phonemes')
        .getFullList<{ id: string; phoneme: string }>();
      phonemes.value = response.map(({ id, phoneme }) => ({ id, phoneme }));
    } catch (error) {
      console.log('🥶 Error fetching phonemes:', error);
      throw new Error('Failed to fetch phonemes');
    }
  };

  const fetchAllPhonograms = async () => {
    if (phonograms.value.length > 0) return;
    try {
      const response = await pb
        .collection('phonograms')
        .getFullList<{ id: string; phonogram: string }>();
      phonograms.value = response.map(({ id, phonogram }) => ({ id, phonogram }));
    } catch (error) {
      console.log('🥶 Error fetching phonograms:', error);
      throw new Error('Failed to fetch phonograms');
    }
  };

  // -------------------
  // Search functions
  // -------------------

  const debouncedWordSearch = debounce(async (value: string) => {
    try {
      await searchDictionary(value);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, DEBOUNCE_TIMEOUT);

  const wordSearch = async (searchParam: string) => {
    debouncedWordSearch(searchParam);
  };

  const searchDictionary = async (searchParam: string) => {
    searchParam = searchParam.trim();
    dictionary.value.clear();

    if (!searchParam) {
      if (initialItemsCache.value.size === 0) {
        await getDictionaryPage(1, 50);
      } else {
        // Restore from cache
        initialItemsCache.value.forEach((entry, word) => {
          dictionary.value.set(word, entry);
        });
      }
      return;
    }

    try {
      const uniqueKey = `${searchParam}_${Date.now()}`;
      const result = await pb.collection('words_with_relations').getList<IDictionaryResponse>(1, 30, {
        filter: `word~"${searchParam}"`,
        requestKey: uniqueKey,
      });

      if (result.items.length) {
        result.items.forEach((item) => {
          const entry = parseViewResponse(item);
          dictionary.value.set(item.word, entry);
          searchState.value.initialResults.set(item.word, entry);
        });
        return;
      }
    } catch (error) {
      console.log('🥶 Error searching dictionary:', error);
      throw new Error('Failed to search dictionary');
    }
  };

  const phonemeSearch = async (
    phonemeSearchArr: { id: string; phoneme: string }[]
  ) => {
    if (phonemeSearchArr.length === 0) {
      await getDictionaryPage(1, 100);
      return;
    }

    dictionary.value.clear();

    // Query words_with_relations view directly with phoneme filter
    // Use ~ operator to search within the phonemes field
    const phonemeFilter = phonemeSearchArr
      .map((phoneme) => `phonemes ~ "${phoneme.phoneme}"`)
      .join(' || '); // Use || for "words with any of these phonemes"

    const wordsResponse = await pb.collection('words_with_relations').getFullList<IDictionaryResponse>({
      filter: phonemeFilter,
      requestKey: null,
    });

    const processedWords = new Map<string, IDictionaryEntry>();

    wordsResponse.forEach((item) => {
      const entry = parseViewResponse(item);

      // Only add words where ALL phonemes are in the learned set
      const allPhonemesLearned = [...entry.phonemes].every((p) =>
        phonemeSearchArr.some((searchP) => searchP.phoneme === p.phoneme)
      );
      if (allPhonemesLearned) {
        processedWords.set(item.word, entry);
      }
    });

    // Update the dictionary with all processed words
    processedWords.forEach((entry, word) => {
      dictionary.value.set(word, entry);
      searchState.value.initialResults.set(word, entry);
    });

    return processedWords;
  };

  const phonogramSearch = async (
    phonogramSearchArr: { id: string; phonogram: string }[]
  ) => {
    if (phonogramSearchArr.length === 0) {
      await getDictionaryPage(1, 100);
      return;
    }

    dictionary.value.clear();

    // Query words_with_relations view directly with phonogram filter
    // Use ~ operator to search within the phonograms field
    const phonogramFilter = phonogramSearchArr
      .map((phonogram) => `phonograms ~ "${phonogram.phonogram}"`)
      .join(' || '); // Use || for "words with any of these phonograms"

    const wordsResponse = await pb.collection('words_with_relations').getFullList<IDictionaryResponse>({
      filter: phonogramFilter,
      requestKey: null,
    });

    const processedWords = new Map<string, IDictionaryEntry>();

    wordsResponse.forEach((item) => {
      const entry = parseViewResponse(item);

      // Only add words where ALL phonograms are in the learned set
      const allPhonogramsLearned = [...entry.phonograms].every((p) =>
        phonogramSearchArr.some((searchP) => searchP.phonogram === p.phonogram)
      );
      if (allPhonogramsLearned) {
        processedWords.set(item.word, entry);
      }
    });

    // Update the dictionary with all processed words
    processedWords.forEach((entry, word) => {
      dictionary.value.set(word, entry);
      searchState.value.initialResults.set(word, entry);
    });

    return processedWords;
  };

  // Combined parallel search function for both phonemes and phonograms
  const combinedSearchParallel = async (
    phonemeSearchArr: { id: string; phoneme: string }[],
    phonogramSearchArr: { id: string; phonogram: string }[]
  ) => {
    dictionary.value.clear();

    // Build combined filter for words_with_relations view
    const filters = [];

    if (phonemeSearchArr.length > 0) {
      const phonemeFilter = phonemeSearchArr
        .map((phoneme) => `phonemes ~ "${phoneme.phoneme}"`)
        .join(' || ');
      filters.push(`(${phonemeFilter})`);
    }

    if (phonogramSearchArr.length > 0) {
      const phonogramFilter = phonogramSearchArr
        .map((phonogram) => `phonograms ~ "${phonogram.phonogram}"`)
        .join(' || ');
      filters.push(`(${phonogramFilter})`);
    }

    if (filters.length === 0) {
      return new Map();
    }

    // Combine filters with AND logic (must match both phonemes AND phonograms if both are specified)
    const combinedFilter = filters.join(' && ');

    const wordsResponse = await pb.collection('words_with_relations').getFullList<IDictionaryResponse>({
      filter: combinedFilter,
      requestKey: null,
    });

    // Process results
    const finalWords = new Map<string, IDictionaryEntry>();

    wordsResponse.forEach((item) => {
      const entry = parseViewResponse(item);

      // Check phoneme criteria - all phonemes must be learned
      const matchesPhonemes =
        phonemeSearchArr.length === 0 ||
        [...entry.phonemes].every((p) =>
          phonemeSearchArr.some((searchP) => searchP.phoneme === p.phoneme)
        );

      // Check phonogram criteria - all phonograms must be learned
      const matchesPhonograms =
        phonogramSearchArr.length === 0 ||
        [...entry.phonograms].every((p) =>
          phonogramSearchArr.some((searchP) => searchP.phonogram === p.phonogram)
        );

      // Add word if it matches the criteria
      if (matchesPhonemes && matchesPhonograms) {
        finalWords.set(item.word, entry);
      }
    });

    // Update the dictionary with final results
    finalWords.forEach((entry, word) => {
      dictionary.value.set(word, entry);
      searchState.value.initialResults.set(word, entry);
    });

    return finalWords;
  };

  // -------------------
  // Delete/Add functions
  // -------------------

  // Generic delete from db function
  const _delete = async (collection: string, id: string, message: string): Promise<boolean> => {
    try {
      const res = await pb.collection(collection).delete(id);
      if (res === true) {
        return true;
      }
      return false;
    } catch (error) {
      console.log('🥶 Error deleting', message, error);
      throw new Error(`Failed to delete ${message}`);
    }
  };

  type Tag = { id: string;[key: string]: string };

  // Remove tag from word
  const removeTagFromWord = async (
    word: string,
    wordId: string,
    tag: Tag,
    isPhoneme: boolean
  ): Promise<void> => {
    const entry = dictionary.value.get(word);
    if (!entry) return;

    const type = isPhoneme ? 'phonemes' : 'phonograms';
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms';

    try {
      const res = await pb.collection(collection).getFullList({
        filter: `word="${wordId}" && ${isPhoneme ? 'phoneme' : 'phonogram'}="${tag.id}"`,
      });

      if (res.length > 0) {
        await _delete(collection, res[0].id, `${tag.tag} from ${word}`);
      }

      entry[type].forEach((value: { id: string;[key: string]: string }) => {
        if (value.id === tag.id) {
          if (isPhoneme) {
            entry.phonemes.delete(value as { id: string; phoneme: string });
          } else {
            entry.phonograms.delete(value as { id: string; phonogram: string });
          }
        }
      });
    } catch (error) {
      console.log('🥶 Error removing tag:', error);
      throw new Error(`Failed to remove ${tag.tag} from ${word}`);
    }
  };

  const addTagToWord = async (
    word: string,
    wordId: string,
    tag: Tag,
    isPhoneme: boolean
  ): Promise<{ type: 'error' | 'success'; message: string }> => {
    const entry = dictionary.value.get(word);

    if (!entry) return { type: 'error', message: 'Word not found' };

    const type = isPhoneme ? 'phonemes' : 'phonograms';
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms';
    const tagKey = isPhoneme ? 'phoneme' : 'phonogram';

    const tagWithCorrectKey = {
      id: tag.id,
      [tagKey]: tag[tagKey],
    };

    let hasTag = false;
    entry[type].forEach((value: { id: string;[key: string]: string }) => {
      if (value.id === tagWithCorrectKey.id) hasTag = true;
    });

    if (hasTag) {
      return {
        type: 'error',
        message: `Failed to add ${tag[tagKey]} to ${word}, it already exists`,
      };
    }

    // Type stuff
    if (isPhoneme) entry.phonemes.add(tagWithCorrectKey as { id: string; phoneme: string });
    else entry.phonograms.add(tagWithCorrectKey as { id: string; phonogram: string });

    try {
      await pb.collection(collection).create({
        word: wordId,
        [tagKey]: tag.id,
      });
      return {
        type: 'success',
        message: `Successfully added ${tag[tagKey]} to ${word}`,
      };
    } catch (error: any) {
      console.error('Error adding tag:', error.message);
      throw new Error(error.message);
    }
  };

  const reorderTags = async (
    word: string,
    wordId: string,
    tags: Array<{ id: string;[key: string]: string }>,
    isPhoneme: boolean
  ): Promise<void> => {
    const entry = dictionary.value.get(word);
    if (!entry) return;
    const originalPhonemes = new Set(entry.phonemes);
    const originalPhonograms = new Set(entry.phonograms);

    // Update local state immediately
    if (isPhoneme) {
      entry.phonemes = new Set(tags) as Set<{ id: string; phoneme: string }>;
    } else {
      entry.phonograms = new Set(tags) as Set<{ id: string; phonogram: string }>;
    }

    const type = isPhoneme ? 'phonemes' : 'phonograms';
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms';
    const tagKey = isPhoneme ? 'phoneme' : 'phonogram';

    try {
      // Delete all existing associations
      const existingTags = await pb.collection(collection).getFullList({
        filter: `word="${wordId}"`,
      });

      for (const tag of existingTags) {
        await _delete(collection, tag.id, `${tagKey} from ${word}`);
      }

      // Create new associations in order
      for (const tag of tags) {
        await pb.collection(collection).create({
          word: wordId,
          [tagKey]: tag.id,
        });
      }
    } catch (error) {
      // Restore original state if an error occurs
      if (isPhoneme) {
        entry.phonemes = originalPhonemes;
      } else {
        entry.phonograms = originalPhonograms;
      }
      console.log('🥶 Error reordering tags:', error);
      throw new Error(`Failed to reorder ${type} for ${word}`);
    }
  };

  const addWordToDictionary = async (
    word: string,
    phonemeIds: string[] = [],
    phonogramIds: string[] = []
  ) => {
    // Check for duplicate
    const existing = await pb
      .collection('global_dictionary')
      .getFirstListItem(`word="${word}"`)
      .catch(() => null);
    if (existing) throw new Error('Word already exists');

    // Validate word
    if (!word || word.length < 1 || word.length > 50) {
      throw new Error('Invalid length word');
    }
    if (!word.match(/^[a-zA-Z]+$/)) {
      throw new Error('Word must contain only letters');
    }

    // Create word
    const created = await pb.collection('global_dictionary').create({ word });
    const wordId = created.id;

    // Add phonemes
    for (const phonemeId of phonemeIds) {
      await pb.collection('word_phonemes').create({ word: wordId, phoneme: phonemeId });
    }
    // Add phonograms
    for (const phonogramId of phonogramIds) {
      await pb.collection('word_phonograms').create({ word: wordId, phonogram: phonogramId });
    }
    return created;
  };

  const addPhonemesToWord = async (wordId: string, phonemeIds: string[]) => {
    for (const phonemeId of phonemeIds) {
      await pb.collection('word_phonemes').create({ word: wordId, phoneme: phonemeId });
    }
  };

  const addPhonogramsToWord = async (wordId: string, phonogramIds: string[]) => {
    for (const phonogramId of phonogramIds) {
      await pb.collection('word_phonograms').create({ word: wordId, phonogram: phonogramId });
    }
  };

  const deleteWordFromDictionary = async (wordId: string) => {
    try {
      // Delete all word_phonemes
      const phonemeLinks = await pb
        .collection('word_phonemes')
        .getFullList({ filter: `word="${wordId}"` });
      for (const link of phonemeLinks) {
        await pb.collection('word_phonemes').delete(link.id);
      }
      // Delete all word_phonograms
      const phonogramLinks = await pb
        .collection('word_phonograms')
        .getFullList({ filter: `word="${wordId}"` });
      for (const link of phonogramLinks) {
        await pb.collection('word_phonograms').delete(link.id);
      }
      // Delete the word itself
      await pb.collection('global_dictionary').delete(wordId);
      return true;
    } catch (error) {
      console.log('🔥 Error deleting word:', error);
      throw new Error('Failed to delete word');
    }
  };

  return {
    getDictionaryPage,
    wordSearch,
    removeTagFromWord,
    addTagToWord,
    fetchAllPhonemes,
    fetchAllPhonograms,
    phonemeSearch,
    phonogramSearch,
    combinedSearchParallel,
    reorderTags,
    initialPageLoad,
    addWordToDictionary,
    addPhonemesToWord,
    addPhonogramsToWord,
    deleteWordFromDictionary,
  };
};

interface IDictionaryResponse {
  id: string;
  word: string;
  phonemes: { id: string; phoneme: string }[];
  phonograms: { id: string; phonogram: string }[];
}

export interface ITableHeaders {
  id: string;
  word: string;
  phonemes: string[];
  phonograms: string[];
}

export interface IDictionaryEntry {
  wordId: string;
  phonemes: Set<{ id: string; phoneme: string }>;
  phonograms: Set<{ id: string; phonogram: string }>;
}
