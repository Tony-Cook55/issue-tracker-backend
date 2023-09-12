
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


//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/users/ (id of User)
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
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++ http://localhost:5000/api/users/register

router.post("/register", (req, res) => {
  const newUser = req.body; // Getting the users data from a form

  // If there is not info in any of the fields throw error status. If not continue with adding user
  if(!newUser || !newUser.email || !newUser.password || !newUser.fullName 
      || !newUser.givenName || !newUser.familyName || !newUser.role){
    res.status(400).json({message: "Error when adding a New User"});
  }
  else{
      // if our new user enters an email that matches an email already entered do error
      const emailExists = usersArray.find((userEmail) => userEmail.email === newUser.email);
      if(emailExists){
        res.status(400).json({message: `User With The Email of ${newUser.email} Already Exists`});
      }


      // IF we have valid data for a new user do this
      if(newUser){

         // Pushing/Adding our new users data into our usersArray
        usersArray.push(newUser);

        // This uses the nanoid we imported and the newUser.id attribute in the array will be a random nanoid
        newUser.id = nanoid()

        // Here we create a new item in the array called usersCreationDate and we set the time it was made at for its value
        newUser.usersCreationDate = new Date();

        // Good Message
        res.status(200).json({message: `Hello ${newUser.fullName}! Glad To Have You`}); // SUCCESS MESSAGE
      }
  }
});
// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++






// /////////////// USER LOGIN IN EMAIL & PASSWORD ///////////////// http://localhost:5000/api/users/login
router.post("/login", (req, res) => {

  const usersLogin = req.body; // Getting the users data from a form

  // If there is not info in any of the fields or in either email or password throw error status. 
  if(!usersLogin || !usersLogin.email || !usersLogin.password){
    res.status(400).json({message: "Please enter your login credentials."});
  }
  else{

    // If our array find finds the usersLogin entered has the email and password set them to const variables
    const emailMatches = usersArray.find((enteredEmail) => enteredEmail.email == usersLogin.email);
    const passwordMatches = usersArray.find((enteredPassword) => enteredPassword.password == usersLogin.password);

    // If the email and password entered DO NOT MATCH anything in the array from above throw error
    if(!emailMatches || !passwordMatches){
      res.status(404).json({message: `Invalid login credential provided. Please try again.`});
    }
    
    // If usersLogin Matches within our array welcome back!
    if(usersLogin){
      res.status(200).json({message: `Welcome back!`});
    }
  }
});
// /////////////// USER LOGIN IN EMAIL & PASSWORD /////////////////











//```````````````````` UPDATE A USER ````````````````````  http://localhost:5000/api/users/ (ID here)
router.put("/:userId", (req, res) => {
  //FIXME: UPDATE EXISTING USER AND SEND RESPONSE AND JSON

  // This gets the ID from the users input
  const userId = req.params.id;

  // Looks for the id user entered to see if its in array
  const currentUser = usersArray.find(currentId => currentId.id == userId);



  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedUser = req.body;  // An .body is an object in updatedBook lets our body read the users id


    
  // If currentUser is true go through update process
  if(currentUser){
    for(const key in updatedUser){  // loops through the keys in the updated User (email, password, fullName, etc.)
      if(currentUser[key] != updatedUser[key]){ // if the current Users key(fullName for ex.) is not == to the updated User 
        currentUser[key] = updatedUser[key]; // go ahead and update it
      }
    }


    // We will save the current User back into the array
    const index = usersArray.findIndex(currentId => currentId.id == userId);
    if(index != -1){
      usersArray[index] == currentUser; // saving Users data back into the array
    }

    res.status(200).json({message: `User ${userId} updated`}); // Success Message

}
else{ // ERROR MESSAGE
  res.status(404).json({message: `User ${userId} not found.`});
}



});
//```````````````````` UPDATE A USER ```````````````````` 










router.delete("/:userId", (req, res) => {
  //FIXME: DELETE USER AND SEND RESPONSE AS JSON
});



export {router as UserRouter};

