
// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";


const router = express.Router();


import debug from "debug";
const debugUser = debug("app:UserRouter");


// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)


//This allows us to encrypt our passwords using this: npm i bcrypt
import bcrypt from "bcrypt";


// Imports all the functions from the database.js file to CRUD Users
import { connect, getAllUsers, getUserById, addNewUser, loginUser, updateUser, deleteUser} from "../../database.js";



// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import Joi from "joi";

import { validId } from "../../middleware/validId.js";

import { validBody } from "../../middleware/validBody.js";

// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));








// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ // http://localhost:5000/api/users/list
router.get("/list", async (req, res) => {
  try {
    // // Calls in the getAllUsers() Function from database.js finding all the Users
    // const allUsers = await getAllUsers();
    // // Success Message
    // res.status(200).json(allUsers);


    /* ENTER THIS INTO MongoDB Compass to allow the search's to be found --> :
        db.*~ENTER COLLECTION HERE~*.createIndex(
          {'$**': 'text'}, 
          {name:'fullText'}
        )
    */


    //   ALL KEYS IN ONE LINE   //
    // Get the Key's from the params query in postman    //pageSize is how many pages you want, pageNumber is the specific page you want
    //let {keywords, role, maxAge, minAge, sortBy, pageSize, pageNumber} = req.query;


    // This stage of the aggregation pipeline is the FILTER it will match what the users input is compared to whats in DB
    const match = {};




  /* key key key key   KEYWORDS  key key key key */

      // Get the Key from the params query in postman called keywords
      let {keywords} = req.query;

      // If there are keywords that match do the following
      if(keywords){
        // If the keywords entered match
        match.$text = {$search: keywords};
      }

  /* key key key key   KEYWORDS  key key key key */




  /* rrrrrrrrrrrrrrrr ROLE rrrrrrrrrrrrrrrr */

      // Get the Key from the params query in postman called role
      let {role} = req.query;

      // If there is a Role entered then do this
      if(role){
        // The entered Role MUST BE EXACT to how it is in the roles array
        match.role = {$eq: role};
      }
  
  /* rrrrrrrrrrrrrrrr ROLE rrrrrrrrrrrrrrrr */




  /* age age age age  AGE OF USER   age age age age */

      // Get the Key from the params query in postman called maxAge and minAge
      let {maxAge} = req.query;

      let {minAge} = req.query;


      const today = new Date(); // Get current date and time
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0); // Remove time from Date


      const pastMaximumDaysOld = new Date(today);
      pastMaximumDaysOld.setDate(pastMaximumDaysOld.getDate() - maxAge); // Set pastMaximumDaysOld to today minus maxAge

      const pastMinimumDaysOld = new Date(today);
      pastMinimumDaysOld.setDate(pastMinimumDaysOld.getDate() - minAge); // Set pastMinimumDaysOld to today minus minAge


      // Format the date objects in the desired format
      const formattedPastMaximumDaysOld = pastMaximumDaysOld.toLocaleString('en-US');
      const formattedPastMinimumDaysOld = pastMinimumDaysOld.toLocaleString('en-US');



      if(maxAge && minAge){
        match.usersCreationDate = {$lte:formattedPastMinimumDaysOld, $gte:formattedPastMaximumDaysOld};
      } else if(minAge){
        match.usersCreationDate = {$lte:formattedPastMinimumDaysOld};
      } else if(maxAge) {
        match.usersCreationDate = {$gte:formattedPastMaximumDaysOld};
      }
      debugUser(`The match is ${JSON.stringify(match)}`);


  /* age age age age  AGE OF USER   age age age age */





  








  /* sssssssssssssssssss SORTING sssssssssssssssssss */

      // // By Default we will sort in ascending order of all these below
      // let sort = {role: 1, givenName: 1, familyName: 1, createdDate: 1};  // The 1 is ascending  ~  -1 is descending order


      // // If the words below are in sortBy it will make sort == and Overwrite that item instead of the default or the last one 
      // switch(sortBy){
      //   // If the user adds givenName in the sortBy it will then switch and sort that and OVERWRITE THE last thing
      //   case "givenName": sort = {givenName : 1}; break;

      //   // If familyName is entered then it will make the familyName be in ascending order
      //   case "familyName": sort = {familyName : 1}; break;

      //   // If role is entered then it will make the role be in ascending order
      //   case "role": sort = {role : 1}; break;
      // }

  /* sssssssssssssssssss SORTING sssssssssssssssssss */





  /* ppppppppppppppppppppp PAGE SEARCHES ppppppppppppppppppppp */

      // // Makes users input into an int or just have 50 pages shown
      // pageSize = parseInt(pageSize) || 50;
      // // Make the users input into an int or just go to page 1
      // pageNumber = parseInt(pageNumber) || 1;

      // // When the user goes on another page such as page 2 it the DB needs to not show things on the first page
      // const skip = (pageNumber - 1) * pageSize;
      // // This is the amount of pages shown at a time
      // const limit = pageSize;

  /* ppppppppppppppppppppp PAGE SEARCHES ppppppppppppppppppppp */






    // This is going to match whats in the param query
    const pipeline = [
      {$match: match}, // This matches the users input with whats in DB
      //{$sort: sort}, // Calls in the sort from the top which by default has the Author ascending


      // // This is the page Number outputs that skips the amount of pages and the limit of pages
      // {$skip: skip},
      // {$limit: limit},
    ]





  // =============== OUTPUT =============== //

      // Connects to our database to allow us to still search
      const db = await connect();

      // This looks though the DB pipeline and aggregates it to either all the results or the search
      const cursor = await db.collection('User').aggregate(pipeline);

      // Sets the cursor's results into an array to be displayed
      const foundUser = await cursor.toArray();

      // Success Message -  Shows the results in an array 
      res.status(200).json(foundUser);

  // =============== OUTPUT =============== //


    debugUser("Success! Found All The Users"); // Message Appears in terminal
    debugUser(`The Query string is ${JSON.stringify(req.query)}`); // Shows the query.params being used
  }
  catch (err) { // Error Message
    res.status(500).json({Error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //






//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/users/ (id of User)

// GETTING A USER BY THEIR userId
// What ever is in the .get("/:HERE!") you must make it the same as what in validId("HERE!")
router.get("/:userId",   validId("userId"),    async (req, res) => {   // the :userId   makes a param variable that we pass in
  try {


    // USING JOI SO WE DON'T NEED THE .params to get users res
    const usersId = req.userId;  // We don't need to have .params is due to the validId("id") is using the id from the params in function


    // were are getting a request with the parameters a user puts for the .id
    //const usersId = req.params.userId;

    // for every usersId return true when our _id is == to the id user enters
    const receivedUserId = await getUserById(usersId);


    if(receivedUserId){
      // Success Message
      res.status(200).json(receivedUserId);
      debugUser(`Success, Got "${receivedUserId.fullName}" Id: ${usersId}\n`); // Message Appears in terminal
    }
    else if(!usersId){
      debugUser(`DEAR GOD`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Id_Error: `User ${usersId} Not Found`});
      debugUser(`User ${usersId} Not Found\n`); // Message Appears in terminal
    }
  }
  catch (err) {
    // Error Message
    res.status(500).json({Error: err.stack});
  }
});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW USER TO THE DATABASE ++++++++++++++++++ http://localhost:5000/api/users/register



// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const registerUserSchema = Joi.object({


  password: Joi.string()
  .trim()
  .min(8)
  .max(50)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Password Is Required', // If password is left blank
    'string.min': 'Password must be at least {#limit} characters long',  // if less than 8 characters
    'string.max': 'Password must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Password is required', // if the password is left uncheck marked and not entered
  }),


  // Code that will allow me to just reuse everything from password
  //repeat_password: Joi.ref('password'),


  email: Joi.string()
  .trim()
  .email({minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
  .required()
  .messages({
    'string.empty': 'Email is required', // if email is left empty
    'string.email': 'Email must be a valid email address', // if email does not contain an @HERE.com
    'any.required': 'Email is required', // if email is left uncheck marked and not entered
  }),


  fullName: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'any.required': 'Full name is required',
    }),


    givenName: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Given name is required',
      'any.required': 'Given name is required',
    }),


    familyName: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Family name is required',
      'any.required': 'Family name is required',
    }),


    role: Joi.array()
    .items(
      Joi.string()
      .valid
      (
        'Developer', 'developer',
        'Business Analysts', 'business analysts',
        'Quality Analyst', 'quality analyst',
        'Product Manager', 'product manager',
        'Technical Manager', 'technical manager',
      )
      .required()
      .min(1) // Minimum of at least one role
      .max(5) // Maximum of five roles
      .messages({
        'string.empty': 'Role is required',
        'any.required': 'Role is required',
        'array.base': 'Roles must be an array',
        'array.min': 'At least one role must be provided',
        'array.max': 'A maximum of five roles can be provided',
        'string.valid': 'Invalid role selected',
      }),
    ),





  }); // END OF registerUserSchema




router.post("/register",  validBody(registerUserSchema),   async (req, res) => {

  // Getting the users data from the body like a form
  const newUser = req.body;


  //Call in our connect to database and then we find the email in the database then the users input
  const dbConnected = await connect();
  const emailExists = await dbConnected.collection("User").findOne({email: newUser.email});

    // If our email matches the email the user inputs throw this error
    if(emailExists){
      res.status(400).json({Error: "Email Already Registered"});
      debugUser(`Email Already Registered \n`); // Message Appears in terminal
    }
    else{  // !!!!!! SUCCESS !!!!!!
      try { // IF we have valid data for a new user do this


          // - USING BCRYPT HERE -  Literally delete this if you don't want the hashes
          // This will generate a salt round and hash the password entered to encrypt it
          newUser.password = await bcrypt.hash(newUser.password, 10)
          // - USING BCRYPT HERE -


          // ACTUALLY ADDS THE USERS INPUT HERE
            // Adds the users input from the body and plugs it into the addNewUser Function
            const addingNewUser = await addNewUser(newUser);
          // ACTUALLY ADDS THE USERS INPUT HERE


        // If user adding a new User is true it will be known as acknowledged
        if(addingNewUser.acknowledged == true){
          // Success Message
          res.status(200).json({User_Added: `User ${newUser.fullName} Added With An Id of ${addingNewUser.insertedId}`});
          debugUser(`User ${newUser.fullName} Added With An Id of ${addingNewUser.insertedId} \n`); // Message Appears in terminal
        }
        /////// IF NO JOI USE BACK UP IS STATEMENTS ///////
        // // If there is not info in any of the fields throw error status. If not continue with adding user
        // else if(!newUser){
        //   res.status(400).json({Error: "Please Enter Information for all Fields"});
        // }
        // else if(!newUser.email){
        //   res.status(400).json({Email_Error: "Please Enter a Email"});
        // }
        // else if(!newUser.password){
        //   res.status(400).json({Password_Error: "Please Enter a Password"});
        // }
        // else if(!newUser.fullName){
        //   res.status(400).json({Full_Name_Error: "Please Enter Your Full Name"});
        // }
        // else if(!newUser.givenName){
        //   res.status(400).json({Given_Name_Error: "Please Enter Your Given Name"});
        // }
        // else if(!newUser.familyName){
        //   res.status(400).json({Family_Name_Error: "Please Enter Your Family Name"});
        // }
        // else if(!newUser.role){
        //   res.status(400).json({Role_Error: "Please Enter Your Role"});
        // }
        else{
          // Error Message
          res.status(400).json({Error: `User ${newUser.fullName} Not Added`});
          debugUser(`User ${newUser.fullName} Not Added  \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({Error: err.stack});
      }
      }
});
// ++++++++++++++++ ADDING A NEW USER TO THE DATABASE ++++++++++++++++++









// /////////////// USER LOGIN WITH EMAIL & PASSWORD ///////////////// http://localhost:5000/api/users/login

// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const loginUserSchema = Joi.object({
  password: Joi.string()
  .trim()
  .min(8)
  .max(50)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Your Password Is Required', // If password is left blank
    'string.min': 'Your Password must be at least {#limit} characters long',  // if less than 8 characters
    'string.max': 'Your Password must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Your Password is required', // if the password is left uncheck marked and not entered
  }),


  email: Joi.string()
  .trim()
  .email({minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
  .required()
  .messages({
    'string.empty': 'Your Email is required', // if email is left empty
    'string.email': 'Your Email must be a valid email address', // if email does not contain an @HERE.com
    'any.required': 'Your Email is required', // if email is left uncheck marked and not entered
  }),
})





router.post("/login",   validBody(loginUserSchema),   async (req, res) => {

    const usersLoginInformation = req.body; // Getting the users data from a body form

    // Inputs users input into the loginUser Function
    const usersLoggedIn = await loginUser(usersLoginInformation);

  try {
      /////// IF NO JOI USE BACK UP IF STATEMENTS ///////
      // // If there is not info in any of the fields or in either email or password throw error status.
      // if(!usersLoginInformation){
      //   res.status(400).json({Error: "Please Enter Your Login Credentials."});
      // }
      // else if(!usersLoginInformation.email){
      //   res.status(400).json({Email_Error: "Please Enter Your Email."});
      // }
      // else if(!usersLoginInformation.password){
      //   res.status(400).json({Password_Error: "Please Enter Your Password."});
      // }
      // else{




        //This targets if the email is correct if not do error
        if (!usersLoggedIn) {
          // Handle the case where the user is not found in the database
          res.status(400).json({ Invalid_Email: 'User Not Found. Please Enter a Valid Email.' });
          debugUser('User not found. Please provide a valid email.'); // Message Appears in terminal
        }
        else{
                  // !!!!! SUCCESS !!!!!
            // If usersLoginInformation Matches within our Database welcome back!  AND
            // If the entered password is the same as the password thats encrypted in database == Success
            if(usersLoggedIn && await bcrypt.compare(usersLoginInformation.password, usersLoggedIn.password)){
              // Success Message
              res.status(200).json({Welcome_Back: `Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`});
              debugUser(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`); // Message Appears in terminal
            }
            else{ // xxxxxx ERROR xxxxxxx
              //Error For passwords
              res.status(400).json({ Invalid_Password: 'User Not Found. Please Enter a Valid Password.' });
              debugUser(`User ${usersLoggedIn.fullName} Not Found`); // Message Appears in terminal
            }
        }
      }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }

});
// /////////////// USER LOGIN WITH EMAIL & PASSWORD /////////////////










// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu  http://localhost:5000/api/users/ (ID here)




// Step 1 Define the Update User Schema  ~~ NO FIELDS ARE REQUIRED FOR USER TO ENTER ~~  THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const updateUserSchema = Joi.object({

  password: Joi.string()
  .trim()
  .min(8)
  .max(50)
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Password Is Required', // If password is left blank
    'string.min': 'Password must be at least {#limit} characters long',  // if less than 8 characters
    'string.max': 'Password must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Password is required', // if the password is left uncheck marked and not entered
  }),


  // Code that will allow me to just reuse everything from password
  //repeat_password: Joi.ref('password'),


  email: Joi.string()
  .trim()
  .email({minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
  .messages({
    'string.empty': 'Email is required', // if email is left empty
    'string.email': 'Email must be a valid email address', // if email does not contain an @HERE.com
    'any.required': 'Email is required', // if email is left uncheck marked and not entered
  }),


  fullName: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Full name is required',
      'any.required': 'Full name is required',
    }),


    givenName: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Given name is required',
      'any.required': 'Given name is required',
    }),


    familyName: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Family name is required',
      'any.required': 'Family name is required',
    }),


    role: Joi.array()
    .items(
      Joi.string()
      .valid
      (
        'Developer', 'developer',
        'Business Analysts', 'business analysts',
        'Quality Analyst', 'quality analyst',
        'Product Manager', 'product manager',
        'Technical Manager', 'technical manager',
      )
      .min(1) // Minimum of at least one role
      .max(5) // Maximum of five roles
      .messages({
        'string.empty': 'Role is required',
        'any.required': 'Role is required',
        'array.base': 'Roles must be an array',
        'array.min': 'At least one role must be provided',
        'array.max': 'A maximum of five roles can be provided',
        'string.valid': 'Invalid role selected',
      }),
    ),


  }); // END OF updateUserSchema





router.put("/:userId",    validId("userId"), validBody(updateUserSchema),   async (req, res) => {

  // This gets the ID from the users input
  const userId = req.userId;   // We don't need to have .params is due to the validId("id") is using the id from the params in function 

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedUserFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
  // .body holds all the information/fields the user enters


  // If the user inputs a password into the field we are going to make a new hash for it
  if(updatedUserFields.password){
          // - USING BCRYPT HERE -  Literally delete this if you don't want the hashes
          // This will generate a salt round and hash the password entered to encrypt it
          updatedUserFields.password = await bcrypt.hash(updatedUserFields.password, 10)
          // - USING BCRYPT HERE -
  }



  try {
              // ------ CHANGES MADE ------ //    Ill be honest I tried to implement this my self but couldn't so this is ChatGBT
                // This is an empty array to store the changes the user makes
                const changesMadeByUserArray = [];

                // Retrieve the original user data from our database using same code from Get All Users
                const originalUsersData = await getAllUsers(userId);

                  // Compare the fields user enters to the original fields in getAllUsers()
                  for (const key in updatedUserFields) {
                    if (originalUsersData[key] !== updatedUserFields[key]) {
                      changesMadeByUserArray.push(key);
                    }
                  }
                // ------ CHANGES MADE ------ //


    // Calls the function and uses the users entered id and body params for the values to pass into function
    const userUpdated = await updateUser(userId, updatedUserFields);


    // If the User is updated once it will gain a property called modifiedCount if this is 1 its true
    if(userUpdated.modifiedCount == 1){
      // Success Message
      res.status(200).json({User_Updated: `User ${userId} updated`,
      // THIS is apart of the success message and it looks to see the length of the array of changes. IF array is 0? say message  'No changes made'
      Changes_Made_To: changesMadeByUserArray.length > 0 ? changesMadeByUserArray : 'No changes made'}); // Success Message
      debugUser(`User ${userId} Updated`);
    }
    else{
      // Error Message
      res.status(404).json({Error: `User ${userId} Not Found`});
      debugUser(`User ${userId} Not Found  \n`); // Message Appears in terminal
    }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }
});
// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu







// -------------------- DELETING USER FROM DATABASE -------------------
router.delete("/delete/:userId",   validId("userId"),   async (req, res) => {

  // gets the id from the users url
  const usersId = req.userId; // We don't need to have .params is due to the validId("id") is using the id from the params in function 


  try {
    // Uses the Users id and plugs it into the deleteUser function
      const deleteTheUser = await deleteUser(usersId);

      if(deleteTheUser.deletedCount == 1){
        // Success Message
        res.status(200).json({User_Deleted: `User ${usersId} Deleted`, usersId});
        debugUser(`User ${usersId} Deleted\n`, usersId); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(404).json({Error: `User ${usersId} Not Found`});
        debugUser(`User ${usersId} Not Found\n`); // Message Appears in terminal
      }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }

});
// -------------------- DELETING USER FROM DATABASE -------------------















export {router as UserRouter};

