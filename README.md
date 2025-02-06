# Student dictionary project

## TODO

- [ ] See if I can use AI to create a better dataset for entering into the database
- [ ] Enter the new dataset into the database
- [✅] Hook up the deleting of phonemes and phonograms to the database
- [ ] Create filters to enter words and view the phonemes and phonograms
- [ ] Improve the search functionality
- [ ] For the search we should have different filters for words and phonemes/phonograms (phonemes/phonograms should have somesort of autocomplete)
- [ ] Add tests for the search functionality
- [ ] Get some error messages displayed to user
  - [ ] Errors for deleting a tag

## Currently writing a script to hit openAI and generate a better dataset for the phonemes and phonograms

- Script is created but some of the phonemes seem to be incorrect, need to continue working on the prompt

## Notes

I think I need the phoneme/phonogram ID so I can remove efficiently, otherwise I have to do a bunch of joins to remove the tag
