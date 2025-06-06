import { pb } from '@/utils/pocketbaseConnection';
import { createPinia, setActivePinia } from 'pinia';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDictionaryService } from '../dictionary.service';

const TEST_USER_EMAIL = process.env.POCKETBASE_TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.POCKETBASE_TEST_USER_PASSWORD;

describe('Dictionary Service (integration)', () => {
  let dictionaryService: ReturnType<typeof useDictionaryService>;
  const testWord = 'testwordxyz';
  const failingWord = 'failingwordxyz_123';
  const testWordId = 'testwordid_xyz123';

  beforeAll(async () => {
    await pb.collection('teachers').authWithPassword(TEST_USER_EMAIL!, TEST_USER_PASSWORD!);
  });

  afterAll(async () => {
    pb.authStore.clear();
  });

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    dictionaryService = useDictionaryService();
  });

  describe('addWordToDictionary', () => {
    it('should only accept valid words', async () => {
      await expect(dictionaryService.addWordToDictionary('')).rejects.toThrow(
        'Invalid length word'
      );
      await expect(dictionaryService.addWordToDictionary(failingWord)).rejects.toThrow(
        'Word must contain only letters'
      );
    });
    it('should add a word with phonemes and phonograms', async () => {
      const phonemeIds = ['qpncsu75nmsc78r', 'd8zqm6c5981r6lz'];
      const phonogramIds = ['1u6ddt2qav69umh'];
      const result = await dictionaryService.addWordToDictionary(
        testWord,
        phonemeIds,
        phonogramIds
      );
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('word', testWord);
      // Clean up
      await dictionaryService.deleteWordFromDictionary(result.id);
    });
    it('should throw if word already exists', async () => {
      const result = await dictionaryService.addWordToDictionary(testWord);
      await expect(dictionaryService.addWordToDictionary(testWord)).rejects.toThrow(
        'Word already exists'
      );
      // Clean up
      await dictionaryService.deleteWordFromDictionary(result.id);
    });
    it('should add a word with no phonemes/phonograms', async () => {
      const result = await dictionaryService.addWordToDictionary(testWord);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('word', testWord);
      // Clean up
      await dictionaryService.deleteWordFromDictionary(result.id);
    });
  });

  describe('addPhonemesToWord', () => {
    it('should add phonemes to a word', async () => {
      const word = await dictionaryService.addWordToDictionary(testWord);

      await expect(
        dictionaryService.addPhonemesToWord(word.id, ['qpncsu75nmsc78r', 'd8zqm6c5981r6lz'])
      ).resolves.not.toThrow();
      // Clean up
      await dictionaryService.deleteWordFromDictionary(word.id);
    });
  });

  describe('addPhonogramsToWord', () => {
    it('should add phonograms to a word', async () => {
      const word = await dictionaryService.addWordToDictionary(testWord);

      await expect(
        dictionaryService.addPhonogramsToWord(word.id, ['1u6ddt2qav69umh'])
      ).resolves.not.toThrow();
      // Clean up
      await dictionaryService.deleteWordFromDictionary(word.id);
    });
  });

  describe('deleteWordFromDictionary', () => {
    it('should delete a word and all its links', async () => {
      const word = await dictionaryService.addWordToDictionary(testWord);
      const wordId = word.id;
      await dictionaryService.deleteWordFromDictionary(wordId);
      // Check that the word was deleted
      expect(
        await pb.collection('global_dictionary').getFullList({ filter: `word="${testWord}"` })
      ).toStrictEqual([]);
      // Check that the phoneme links were deleted
      expect(
        await pb.collection('word_phonemes').getFullList({ filter: `word="${wordId}"` })
      ).toStrictEqual([]);
      // Check that the phonogram links were deleted
      expect(
        await pb.collection('word_phonograms').getFullList({ filter: `word="${wordId}"` })
      ).toStrictEqual([]);
    });
    it('should throw if delete fails', async () => {
      await expect(dictionaryService.deleteWordFromDictionary('nonexistentid')).rejects.toThrow(
        'Failed to delete word'
      );
    });
  });
});
