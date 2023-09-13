
import express from "express";


const router = express.Router();


import debug from "debug";
const debugUser = debug("app:UserRouter");


// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)




router.use(express.urlencoded({extended:false}));


// FIXME: USE THIS ARRAY TO STORE USER DATA IN FOR NOW
// REPLACE THIS WITH A DATABASE IN A LATER ASSIGNMENT
const usersArray = [
  {
    "email": "123TonyCook@gmail.com",
    "password": "123Tony",
    "fullName": "Tony Cook",
    "givenName": "Tony",
    "familyName": "Cook",
    "role": "Student" ,
    "id": "1",
    "usersCreationDate": "",
    "lastUpdated": "",
  },

  {
    "email": "123TBoneyBook@gmail.com",
    "password": "123Boney",
    "fullName": "Boney Book",
    "givenName": "Boney",
    "familyName": "Book",
    "role": "Teacher" ,
    "id": "2",
    "usersCreationDate": "",
    "lastUpdated": "",
  },

  {
    "email": "123LonelyLook@gmail.com",
    "password": "123Lonely",
    "fullName": "Lonely Look",
    "givenName": "Lonely",
    "familyName": "Look",
    "role": "Nascar Driver" ,
    "id": "3",
    "usersCreationDate": "",
    "lastUpdated": "",
  },

  {
    "email": "123ToryCrook@gmail.com",
    "password": "123Tory",
    "fullName": "Tory Crook",
    "givenName": "Tory",
    "familyName": "Crook",
    "role": "Criminal" ,
    "id": "4",
    "usersCreationDate": "",
    "lastUpdated": "",
  },
];



// GETS THE LIST OF ALL USERS FROM THE usersArray
router.get("/list", (req, res) => {
  res.json(usersArray);
});
// GETS THE LIST OF ALL USERS FROM THE usersArray



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
  if(!newUser){
    res.status(400).json({message: "Please Enter Information for all Fields"});
  }
  else if(!newUser.email){
    res.status(400).json({message: "Please Enter a Email"});
  }
  else if(!newUser.password){
    res.status(400).json({message: "Please Enter a Password"});
  }
  else if(!newUser.fullName){
    res.status(400).json({message: "Please Enter Your Full Name"});
  }
  else if(!newUser.givenName){
    res.status(400).json({message: "Please Enter Your Given Name"});
  }
  else if(!newUser.familyName){
    res.status(400).json({message: "Please Enter Your Family Name"});
  }
  else if(!newUser.role){
    res.status(400).json({message: "Please Enter Your Role"});
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
        newUser.usersCreationDate = new Date().toDateString();

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
  if(!usersLogin){
    res.status(400).json({message: "Please Enter Your Login Credentials."});
  }
  else if(!usersLogin.email){
    res.status(400).json({message: "Please Enter Your Email."});
  }
  else if(!usersLogin.password){
    res.status(400).json({message: "Please Enter Your Password."});
  }
  else{

    // If our array find finds the usersLogin entered has the email and password set them to const variables
    const emailMatches = usersArray.find((enteredEmail) => enteredEmail.email == usersLogin.email);
    const passwordMatches = usersArray.find((enteredPassword) => enteredPassword.password == usersLogin.password);

    // If the email and password entered DO NOT MATCH anything in the array from above throw error
    if(!emailMatches && !passwordMatches){
      res.status(404).json({message: `Invalid login credential provided. Please try again.`});
    }
    if(!emailMatches){ // If just email doesn't match
      res.status(404).json({message: `Invalid Email. Please Re-Enter Email.`});
    }
    else if(!passwordMatches){ // If just password doesn't match
      res.status(404).json({message: `Invalid Password. Please Re-Enter Password.`});
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

  // This gets the ID from the users input
  const userId = req.params.userId; // <--- .userId Must equal whatever is in the  router.put("/:WHATEVER IS HERE", (req, res) => {

  // Looks for the id user entered to see if its in array
  const currentUser = usersArray.find(currentId => currentId.id == userId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedUser = req.body;  // An .body is an object in updatedBook lets our body read the users id
  // .body holds all the information/fields the user enters 



  // If currentUser is true go through update process
  if(currentUser){
    for(const key in updatedUser){  // loops through the keys in the updated User (email, password, fullName, etc.)
      if(currentUser[key] != updatedUser[key]){ // if the current Users key(fullName for ex.) is not == to the updated User 
        currentUser[key] = updatedUser[key]; // go ahead and update it
      }
    }


    // We will save the current User back into the array
    const usersPositionInArray = usersArray.findIndex(currentId => currentId.id == userId);
    if(usersPositionInArray != -1){
      usersArray[usersPositionInArray] = currentUser; // saving Users data back into the array

      // Here we create a new item in the array called lastUpdated and we set the time it was made at for its value
      currentUser.lastUpdated = new Date().toDateString();
    }

    res.status(200).json({message: `User ${userId} updated`}); // Success Message

}
else{ // ERROR MESSAGE
  res.status(404).json({message: `User ${userId} not found.`});
}



});
//```````````````````` UPDATE A USER ```````````````````` 





// -------------------- DELETING USER FROM ARRAY -------------------
router.delete("/:userId", (req, res) => {
  //FIXME: DELETE USER AND SEND RESPONSE AS JSON

  
  // Getting the id from the users URL
  const userId = req.params.userId;  //<--- .userId Must equal whatever is in the "/:(Whatever is here)"


  // Reads the position that a User is in based on the array
  const usersPositionInArray = usersArray.findIndex(idOfUser => idOfUser.id == userId);

  // If the the users position in the array is valid .splice it out of its current position in the array
  if(usersPositionInArray != -1){ 
    usersArray.splice(usersPositionInArray,1); // this is starting at what item and the amount of items (index, 1 item)
    res.status(200).json({message: `User ${userId} deleted`}); // Success Message
  }
  else{
    res.status(404).json({message: `User ${userId} Not Found`}); // Error Message
  }
});
// -------------------- DELETING USER FROM ARRAY -------------------















export {router as UserRouter};

