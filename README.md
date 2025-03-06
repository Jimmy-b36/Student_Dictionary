# Student dictionary project

## TODO

- [✅] Fix draggable, you should not be able to drag phonemes/phonograms into another word
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

## Just added very basic login with middleware and vue router

- No error handling
- No signup page yet
- Need to add a state for no results found
- Need to add loading state

## Notes

What happens if 2 admins make changes at the same time?

## Requirements

- Login page
  - Need to learn about saving tokens to storage then having an auto login
  - Need to have login with Google/GitHub
- Logged home page
  - Display for each student saved
  - Table for quickly searching words
  - Table for favourites
