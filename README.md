# Student dictionary project

## TODO

- [✅] Enter the new dataset into the database
- [✅] Improve the search functionality
  - [✅] Create filters to enter words and view the phonemes and phonograms
- [✅] For the search we should have different filters for words and phonemes/phonograms (phonemes/phonograms should have somesort of autocomplete)
  - [✅] What would be better, an autocomplete or select from a list
- [✅] Review error handling for adding and removing tags
- [ ] Add state for no results found
- [ ] Add loading state for table results loading
- [ ] Add tests for the search functionality
- [ ] Add tests for adding and removing tags
- [ ] Login functionality
  - [ ] How many different users do we need? [Admin, Teacher, Student]
  - [ ] Do I need a middleware or will Pocketbase handle it?
  - [ ] Need to save a token to storage so I don't have to login each time
- [ ] Create student profile page for learnt words
  - [ ] table with word, phonemes, phonograms, date added, Notes
  - [ ] Add remove and edit functionality

## Just added the ability to search by phonemes and phonograms

- Need to add a state for no results found
- Need to add loading state

## Notes

## Requirements

- Login page
  - Need to learn about saving tokens to storage then having an auto login
  - Need to have login with Google/GitHub
- Logged home page
  - Display for each student saved
  - Table for quickly searching words
  - Table for favourites
