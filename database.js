
// I I I I I I I    IMPORTS   I I I I I I I
import * as dotenv from 'dotenv';
dotenv.config();


import { MongoClient, ObjectId } from "mongodb";
import debug from 'debug';
const debugDatabase = debug('app:Database');

// I I I I I I I    IMPORTS   I I I I I I I


/** Generate/Parse an ObjectId */
const newId = (str) => new ObjectId(str);



/** Global variable storing the open connection, do not use it directly. */
let _db = null;



/** Connect to the database */
async function connect(){
  if (!_db) {
    const connectionString = process.env.DB_URL;
    const dbName = process.env.DB_NAME;
    const client = await MongoClient.connect(connectionString);
    _db = client.db(dbName);
    debugDatabase('Connected.');
  }
  return _db;
}



/** Connect to the database and verify the connection */
async function ping() {
  const db = await connect();
  await db.command({ ping: 1 });
  debugDatabase("Pinged your deployment. You successfully connected to MongoDB!\n");
}




// ******************************* USERS ********************************** //


// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //
async function getAllUsers(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // "User" == the collection name in our database
  const allUsers = await dbConnected.collection("User").find().toArray();

  //Returns All Users to postman
  return allUsers;
}
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //



// !!!!!!!!!!!!!!! SEARCHING FOR A USER BY ID !!!!!!!!!!!!!!! //
async function getUserById(usersId){
  const dbConnected = await connect();
                                       // Uses this call in:  import { ObjectId } from "mongodb";
  const findUserById = await dbConnected.collection("User").findOne({_id: new ObjectId(usersId)});

  return findUserById;
}
// !!!!!!!!!!!!!!! SEARCHING FOR A USER BY ID !!!!!!!!!!!!!!! //





// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //
async function addNewUser(newUser){
  const dbConnected = await connect();


  // This date is for searching purposes
  newUser.createdOn = new Date();

  // Here we create a new item in the database called usersCreationDate and we set the time it was made at for its value
  //newUser.usersCreationDate = new Date().toDateString();
  newUser.usersCreationDate = new Date().toLocaleString('en-US'); //.toLocaleString('en-US')


  const addingNewUser = await dbConnected.collection("User").insertOne(newUser);


  return addingNewUser;
}
// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //





// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL //
async function loginUser(userLogin){

  const dbConnected = await connect();

  // Finding a user based on their email entered
  const userLoggedIn = await dbConnected.collection("User").findOne({email: userLogin.email});

  // It will either find or not find the user based on the inputs
  return userLoggedIn;

}
// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL //





// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu //
async function updateUser(usersId, updatedUserFields){

  const dbConnected = await connect();


  // This date is for searching purposes
  updatedUserFields.lastUpdated = new Date();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  updatedUserFields.userLastUpdated = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const userUpdated = await dbConnected.collection("User").updateOne({_id: new ObjectId(usersId)},{$set:{...updatedUserFields}});

  return userUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu //





// ------------------ DELETE USER BY ID ------------------ //
async function deleteUser(usersId){

  const dbConnected = await connect();

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const deleteTheUser = await dbConnected.collection("User").deleteOne({_id: new ObjectId(usersId)});

  return deleteTheUser;
}
// ------------------ DELETE USER BY ID ------------------ //



  // ******** USERS EXPORTS ******** //
export{
  getAllUsers,
  getUserById,
  addNewUser,
  loginUser,
  updateUser,
  deleteUser
};
  // ******** USERS EXPORTS ******** //



// ******************************* USERS ********************************** //




















// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BUGS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //
async function getAllBugs(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // "User" == the collection name in our database
  const allBugs = await dbConnected.collection("Bug").find().toArray();

  //Returns All Bugs to postman
  return allBugs;
}
// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //




// !!!!!!!!!!!!!!! SEARCHING FOR A BUG BY ID !!!!!!!!!!!!!!! //
async function getBugById(bugsId){
  const dbConnected = await connect();
                                       // Uses this call in:  import { ObjectId } from "mongodb";
  const findBugById = await dbConnected.collection("Bug").findOne({_id: new ObjectId(bugsId)});

  return findBugById;
}
// !!!!!!!!!!!!!!! SEARCHING FOR A BUG BY ID !!!!!!!!!!!!!!! //



// +++++++++++++++++ ADDING A NEW BUG +++++++++++++++++ //
async function addNewBug(newBug){
  const dbConnected = await connect();


  // This is all of the data the user inputs into the body params
  const bugAddedData = {
    bugAddedByUserFullName: newBug.bugAddedByUserFullName,
    bugAddedByUser: newBug.bugAddedByUser,
    createdOn: new Date(),
    bugsCreationDate: new Date().toLocaleString('en-US'),
  };


  // Add the bugAddedData to the newBug object as an array to allow it to be inside an array
  newBug.bugAdded = [bugAddedData];


  // Remove the individual properties from newBug to be inside of the array
  delete newBug.bugAddedByUserFullName;
  delete newBug.bugAddedByUser;


  // Insert the newBug into the database
  const addingNewBug = await dbConnected.collection("Bug").insertOne(newBug);


  return addingNewBug;
}
// +++++++++++++++++ ADDING A NEW BUG +++++++++++++++++ //



// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu //
async function updateBug(bugsId, updateBugFields){

  const dbConnected = await connect();

  // This date is for searching purposes
  updateBugFields.lastUpdated = new Date();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  updateBugFields.bugLastUpdated = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugUpdated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...updateBugFields}});

  return bugUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu //




// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc // approved, unapproved, duplicate, by default unclassified
async function updateClassification(bugsId, classifyBugFields){

  const dbConnected = await connect();

  // This date is for searching purposes
  classifyBugFields.lastUpdated = new Date();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  classifyBugFields.bugLastUpdated = new Date().toLocaleString('en-US');


  // This date is for searching purposes
  classifyBugFields.classifiedOn = new Date();

  //This will create a new item called classifiedOn which sets the current date its classified on
  classifyBugFields.bugClassifiedOn = new Date().toLocaleString('en-US');

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugClassificationUpdated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...classifyBugFields}});

  return bugClassificationUpdated;
}
// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc //




// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa
async function assignBugToUser(bugsId, assignedBugFields){


  const dbConnected = await connect();

  // This will create the array with the user's data
  const assignBugToUserStructure = {
    assignedToUserId: assignedBugFields.assignedToUserId,
    assignedByUser: userIdFound.fullName, // Assign the full name of the user
    assignedOn: new Date(),
    bugAssignedOn: new Date().toLocaleString('en-US'),
  };

  // Update the bug by pushing the new assignment data into the 'assignedTo' array
  const updatedBug = await dbConnected.collection("Bug").updateOne(
    { _id: new ObjectId(bugsId) },
    {
      $push: {
        assignedTo: assignBugToUserStructure,
      },
    }
  );

  return updatedBug;

}
// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa //





// xxxxxxxxxxxxxx CLOSING A BUG xxxxxxxxxxxxxx
async function closeBug(bugsId, closedFields){

  const dbConnected = await connect();


  // This date is for searching purposes
  closedFields.lastUpdated = new Date();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  closedFields.bugLastUpdated = new Date().toLocaleString('en-US');



  // This date is for searching purposes
  closedFields.closedOn = new Date();

  //This will create a new item called assignedOn which sets the current date its classified on
  closedFields.bugClosedOn = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugClosed = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...closedFields}});

  return bugClosed;
}
// xxxxxxxxxxxxxx CLOSING A BUG xxxxxxxxxxxxxx //







// ********************* ONLY FOR MY USE NOT THE USER *********************
// ------------------ DELETE BUG BY ID ------------------ //
async function deleteBug(bugsId){

  const dbConnected = await connect();

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const deleteTheBug = await dbConnected.collection("Bug").deleteOne({_id: new ObjectId(bugsId)});

  return deleteTheBug;
}
// ------------------ DELETE BUG BY ID ------------------ //
// ********************* ONLY FOR MY USE NOT THE USER *********************







  // !!!!!! BUGS EXPORTS !!!!!!!! //
export{
  getAllBugs,
  getBugById,
  addNewBug,
  updateBug,
  updateClassification,
  assignBugToUser,
  closeBug,


  deleteBug
};

  // !!!!!! BUGS EXPORTS !!!!!!!! //

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BUGS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //


















// cccccccccccccccccccccccccccccccccccccccccccccc COMMENTS cccccccccccccccccccccccccccccccccccccccccccccc // 




// ~~~~~~~~~~~~~~~~ FIND ALL COMMENTS ~~~~~~~~~~~~~~~~ //
async function getAllCommentsInBug(bugId){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // Finds the Bugs Id
  const foundBugId = await dbConnected.collection("Bug").findOne({ _id: new ObjectId(bugId) });

  /*
  if(foundBugId){
    return foundBugId.comments; // This will return all of the comments in the comments array
  }
  */

  return foundBugId; // This will throw our else error
}
// ~~~~~~~~~~~~~~~~ FIND ALL COMMENTS ~~~~~~~~~~~~~~~~ //





// !!!!!!!!!!!!!!! SEARCHING FOR A COMMENT IN BUG BY ID !!!!!!!!!!!!!!! //
async function getCommentById(bugsId, commentsId) {
  const dbConnected = await connect();

  // Finds the Bugs Id 
  const foundBugsId = await dbConnected.collection("Bug").findOne({ _id: new ObjectId(bugsId) });


  // If the bug is found Do This
  if (foundBugsId) {  
    // in the bug we access the array named comments. Next we use a find to allow us to do a match to check if the entered Id by the user matches the pre-existing comments Id
    const foundCommentsId = foundBugsId.comments.find(originalCommentId => originalCommentId._id.toString() === commentsId);


    // If the comment id is found from above then we return it out to be displayed for user
    if (foundCommentsId) {
      return foundCommentsId; 
    } 
    else {
      return null; // Comment not found within the bug
    }
  }


  return null; // Bug with Entered Id is not found throw my else error
}
// !!!!!!!!!!!!!!! SEARCHING FOR A COMMENT IN BUG BY ID !!!!!!!!!!!!!!! //





// +++++++++++++++++++ NEW COMMENT +++++++++++++++++++ //      http://localhost:5000/api/bugs/652401b1c0e6b2745f847157/comment/new
async function newComment(bugsId, newCommentFields){

  const dbConnected = await connect();


    // Create a new ObjectId for the comment
    const commentId = new ObjectId();

  // This is lets us make the items the user adds get put into an array named comments
  // Here we make the structure in how we want the comment to be added in the array
  const commentStructure = {
    _id: commentId, // This allows us to add a new ID For each bug
    author: newCommentFields.author, // this plugs in the users info for the Author
    message: newCommentFields.message, // this plugs in the users message for the Comment
    createdOn: new Date().toLocaleString('en-US'),
  };


  const commentCreated = await dbConnected.collection("Bug").updateOne(
    { _id: new ObjectId(bugsId) },
    {
      $push: {
        comments: commentStructure,
      },
    }
  );


  /*   UPON MAKING A COMMENT WITH THE STRUCTURE WE GET THIS
    "comments": [
        {
            "author": "Jimmy 1",
            "message": "This is a test Comment to see if It work"
            "createdOn": "10/9/2023, 9:23:47 AM",
        },
*/


  //This will create a new item called classifiedOn which sets the current date its classified on
  //newCommentFields.createdOn = new Date().toLocaleString('en-US');

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  //const commentCreated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...newCommentFields}});

  return commentCreated;
}
// +++++++++++++++++++ NEW COMMENT +++++++++++++++++++ //






// ********************* ONLY FOR MY USE NOT THE USER *********************
// ------------------ DELETE BUG BY ID ------------------ //
async function deleteComment(bugsId, commentsId){

  const dbConnected = await connect();

  const deleteCommentFromBug = await dbConnected.collection("Bug").updateOne(
    { _id: new ObjectId(bugsId) },
    { $pull: { comments: { _id: new ObjectId(commentsId) } } }
  );


    return deleteCommentFromBug.modifiedCount > 0;


}
// ------------------ DELETE BUG BY ID ------------------ //
// ********************* ONLY FOR MY USE NOT THE USER *********************







export{
  getAllCommentsInBug,
  getCommentById,
  newComment,



  deleteComment
};


// cccccccccccccccccccccccccccccccccccccccccccccc COMMENTS cccccccccccccccccccccccccccccccccccccccccccccc // 





















// tc tc tc tc tc tc tc tc tc tc tc  tc tc tc TEST CASES tc tc tc tc tc tc  tc tc tc tc tc tc tc //




// ~~~~~~~~~~~~~~~~ FIND ALL TEST CASES ~~~~~~~~~~~~~~~~ //
async function getAllTestCasesInBug(bugId){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // Finds the Bugs Id
  const foundBugId = await dbConnected.collection("Bug").findOne({ _id: new ObjectId(bugId) });


  return foundBugId; // This will throw our else error
}
// ~~~~~~~~~~~~~~~~ FIND ALL TEST CASES ~~~~~~~~~~~~~~~~ //





// !!!!!!!!!!!!!!! SEARCHING FOR A TEST CASE IN BUG BY ID !!!!!!!!!!!!!!! //
async function getTestCaseById(bugsId, testCasesId) {
  const dbConnected = await connect();

  // Finds the Bugs Id 
  const foundBugsId = await dbConnected.collection("Bug").findOne({ _id: new ObjectId(bugsId) });


  // If the bug is found Do This
  if (foundBugsId) {  
    // in the bug we access the array named testCases. Next we use a find to allow us to do a match to check if the entered Id by the user matches the pre-existing testCase Id
    const foundTestCasesId = foundBugsId.testCases.find(originalTestCaseId => originalTestCaseId._id.toString() === testCasesId);


    // If the testCase id is found from above then we return it out to be displayed for user
    if (foundTestCasesId) {
      return foundTestCasesId; 
    } 
    else {
      return null; // testCases not found within the bug
    }
  }


  return null; // Bug with Entered Id is not found throw my else error
}
// !!!!!!!!!!!!!!! SEARCHING FOR A TEST CASE IN BUG BY ID !!!!!!!!!!!!!!! //






// +++++++++++++++++++ NEW TEST CASE  +++++++++++++++++++ // 
async function newTestCase(bugsId, newTestCaseFields){

  const dbConnected = await connect();


    // Create a new ObjectId for the Test Case
    const testCaseId = new ObjectId();



// Auto make appliedFixOnDate to "No Fix Date Yet" by default
let appliedFixOnDate = "No Fix Date Yet";

// Now if the user enters true for passed we will set it to the correctly formatted date they added 
if (newTestCaseFields.passed === "True" || newTestCaseFields.passed === "true") {

  // If the test case is passed, use the users entered appliedFixOnDate
  appliedFixOnDate = newTestCaseFields.appliedFixOnDate;


  // --- THIS IS ALL HERE TO ALLOW THE CURRENT TIME TO BE ADDED BEHIND USERS INPUTTED DATE TO SHOW WHEN THEY ADDED IT SO THEY DON'T HAVE TO --- //
    // Get the current time
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
  
    // Determine whether it's AM or PM
    const amOrPm = hours >= 12 ? "PM" : "AM";
  
    // Format hours in 12-hour format
    const formattedHours = hours % 12 || 12;
  
    // Append the time with AM or PM to the user's date
    appliedFixOnDate += ` ${formattedHours}:${minutes}:${seconds} ${amOrPm}`;
  // --- THIS IS ALL HERE TO ALLOW THE CURRENT TIME TO BE ADDED BEHIND USERS INPUTTED DATE TO SHOW WHEN THEY ADDED IT SO THEY DON'T HAVE TO --- //

}



// This will create the array with the users data
const testCaseStructure = {

  _id: testCaseId,

  title: newTestCaseFields.title,

  // Users inputted Id for the User that has a Role of Quality Analysis
  userId: newTestCaseFields.userId,

  createdOn: new Date().toLocaleString('en-US'),
  passed: newTestCaseFields.passed,
  versionRelease: newTestCaseFields.versionRelease,

  // This will either plug in the default message or the users input date depending on if passed == true || false
  appliedFixOnDate: appliedFixOnDate,
};



// Updates the bug with the new array
const createdTestCase = await dbConnected.collection("Bug").updateOne(
  { _id: new ObjectId(bugsId) },
  {
    $push: {
      testCases: testCaseStructure,
    },
  }
);


return createdTestCase;

}
// +++++++++++++++++++ NEW TEST CASE +++++++++++++++++++ //








// uuuuuuuuuuuuuuuuu UPDATE A TEST CASE uuuuuuuuuuuuuuuuu //
async function updateTestCase(bugsId, testCasesId, updatedTestCaseFields){

  const dbConnected = await connect();


  // Create a query to find the specific bug by its _id
  const findTestCaseInBug = {
    _id: new ObjectId(bugsId), // Finds the bug Id
    "testCases._id": new ObjectId(testCasesId)  // Finds The specific Test Case Id The User enters into testCasesId
  };


  // This makes it to where the users inputted fields will now be set to what they enter
  const updateTestCaseFields = {
    $set: {}
  };


  // This will loop over every property in the fields (title, passed, versionRelease, appliedFixOnDate)
  // field is each item the user can input
  for (const field in updatedTestCaseFields) {
    updateTestCaseFields.$set[`testCases.$.${field}`] = updatedTestCaseFields[field];
  }


  // Update the matched test case within the array
  const testCasesUpdated = await dbConnected.collection("Bug").updateOne(findTestCaseInBug, updateTestCaseFields);


  return testCasesUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A TEST CASE uuuuuuuuuuuuuuuuu //







// ------------------ DELETE BUG BY ID ------------------ //
async function deleteTestCase(bugsId, testCasesId){

  const dbConnected = await connect();

  const deleteTestCaseFromBug = await dbConnected.collection("Bug").updateOne(
    { _id: new ObjectId(bugsId) },
    { $pull: { testCases: { _id: new ObjectId(testCasesId) } } }
  );


    return deleteTestCaseFromBug.modifiedCount > 0;


}
// ------------------ DELETE BUG BY ID ------------------ //



export{
  getAllTestCasesInBug,
  getTestCaseById,
  newTestCase,
  updateTestCase,
  deleteTestCase
};


// tc tc tc tc tc tc tc tc tc tc tc  tc tc tc TEST CASES tc tc tc tc tc tc  tc tc tc tc tc tc tc //

















// export functions
export {
  newId,
  connect,
  ping
};

// test the database connection
ping();
