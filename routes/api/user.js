
import express from "express";


const router = express.Router();


import debug from "debug";
const debugUser = debug("app:UserRouter");



import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)




router.use(express.urlencoded({extended:false}));


// FIXME: USE THIS ARRAY TO STORE USER DATA IN FOR NOW
// REPLACE THIS WITH A DATABASE IN A LATER ASSIGNMENT
const usersArray = [
  {"email": "123TonyCook@gmail.com", "password": "123Tony","fullName": "Tony Cook",
    "givenName": "Tony", "familyName": "Cook", "role": "Student" , "id": 1},

  {"email": "123TBoneyBook@gmail.com", "password": "123Boney","fullName": "Boney Book",
    "givenName": "Boney", "familyName": "Book", "role": "Teacher" , "id": 2},

  {"email": "123LonelyLook@gmail.com", "password": "123Lonely","fullName": "Lonely Look",
    "givenName": "Lonely", "familyName": "Look", "role": "Nascar Driver" , "id": 3},

  {"email": "123ToryCrook@gmail.com", "password": "123Tory","fullName": "Tory Crook",
    "givenName": "Tory", "familyName": "Crook", "role": "Criminal" , "id": 4},
];



// GETS THE LIST OF ALL USERS FROM THE usersArray
router.get("/list", (req, res) => {
  res.json(usersArray);
});


//!!!!!!!!!!!!!!!!!!  SEARCHING BY _id //!!!!!!!!!!!!!!!!!!   http://localhost:5000/api/users/ (id of User)
// GETTING A USER BY THEIR userId
router.get("/:userId", (req, res) => {   // the :userId   makes a param variable that we pass in
  //READS THE userId from the URL and stores it in a variable
  const userId = req.params.userId; // were are getting a request with the parameters a user puts for the .id

  // This finds the input the user put and if it matches an ID it will get it and display
  const getUserID = usersArray.find(findUserID => findUserID.id == userId);


    // If users id == users ID show that user
    if(getUserID){
      res.status(200).json(getUserID); // SUCCESS MESSAGE
    }
    else{ // Error message
      res.status(404).json({message: `ID ${userId} not found`}); // ERROR MESSAGE
    }
});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY _id //!!!!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++ http://localhost:5000/api/users/register

router.post("/register", (req, res) => {
  const newUser = req.body; // Getting the users data from a form

  // IF we have valid data for a new user do this
  if(newUser){

      // This is adding a new id
      //const id = books.length + 1;  // gets the length of the array and counts them so it can +1 for new ID 
      //newBook._id = id; // Sets the newBooks _id to +1 after the last _id of books


      usersArray.push(newUser); // Pushing our new users data into our usersArray

      // This uses the nanoid we imported and the newUser.id attribute in the array will be a random nanoid
      newUser.id = nanoid()

      res.status(200).json({message: `Hello ${newUser.fullName}! Glad To Have You)`}); // SUCCESS MESSAGE
  }


  //TODO: FIXME: FIX ERROR MESSAGES
  else if(newUser == usersArray.find(findUsersEmail => findUsersEmail.id == email)){ // IF WE ALREADY HAVE IT??????????asdasd
    res.status(400).json({message: 'User With The Email of ${newUser.email} Already Exists'});
  }
  else{ // ERROR MESSAGE
    res.status(400).json({message: "Error when adding a New User"});
  }

});
// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++













router.post("/login", (req, res) => {
  //FIXME: CHECK USERS EMAIL AND PASSWORD AND SEND RESPONSE AS JSON
});


router.put("/:userId", (req, res) => {
  //FIXME: UPDATE EXISTING USER AND SEND RESPONSE AND JSON
});


router.delete("/:userId", (req, res) => {
  //FIXME: DELETE USER AND SEND RESPONSE AS JSON
});



export {router as UserRouter};

