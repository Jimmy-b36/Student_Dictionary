# Student dictionary project

## TODO

- [ ] Enter the new dataset into the database
- [ ] Improve the search functionality
  - [ ] Create filters to enter words and view the phonemes and phonograms
- [ ] For the search we should have different filters for words and phonemes/phonograms (phonemes/phonograms should have somesort of autocomplete)
  - [ ] What would be better, an autocomplete or select from a list
- [ ] Add tests for the search functionality
- [ ] Review error handling for adding and removing tags
- [ ] Login functionality
  - [ ] How many different users do we need? [Admin, Teacher, Student]

## Just added the ability to add tags to a word

- Need to repopulate db with new dataset

## Notes

I think I need the phoneme/phonogram ID so I can remove efficiently, otherwise I have to do a bunch of joins to remove the tag
