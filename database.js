
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


  // Here we create a new item in the database called usersCreationDate and we set the time it was made at for its value
  //newUser.usersCreationDate = new Date().toDateString();
  newUser.usersCreationDate = new Date().toLocaleString('en-US');


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


  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  updatedUserFields.lastUpdated = new Date().toLocaleString('en-US');


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


  // Here we create a new item in the database called usersCreationDate and we set the time it was made at for its value
  //newUser.usersCreationDate = new Date().toDateString();
  newBug.bugsCreationDate = new Date().toLocaleString('en-US');


  const addingNewBug = await dbConnected.collection("Bug").insertOne(newBug);


  return addingNewBug;
}
// +++++++++++++++++ ADDING A NEW BUG +++++++++++++++++ //



// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu //
async function updateBug(bugsId, updateBugFields){

  const dbConnected = await connect();


  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  updateBugFields.lastUpdated = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugUpdated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...updateBugFields}});

  return bugUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu //




// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc // approved, unapproved, duplicate, by default unclassified
async function updateClassification(bugsId, classifyBugFields){

  const dbConnected = await connect();


  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  classifyBugFields.lastUpdated = new Date().toLocaleString('en-US');

  //This will create a new item called classifiedOn which sets the current date its classified on
  classifyBugFields.classifiedOn = new Date().toLocaleString('en-US');

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugClassificationUpdated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...classifyBugFields}});

  return bugClassificationUpdated;
}
// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc //




// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa
async function assignBugToUser(bugsId, assignedBugFields){

  const dbConnected = await connect();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  assignedBugFields.lastUpdated = new Date().toLocaleString('en-US');

  //This will create a new item called assignedOn which sets the current date its classified on
  assignedBugFields.assignedOn = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugAssigned = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...assignedBugFields}});

  return bugAssigned;
}
// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa //





// xxxxxxxxxxxxxx CLOSING A BUG xxxxxxxxxxxxxx
async function closeBug(bugsId, closedFields){

  const dbConnected = await connect();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  closedFields.lastUpdated = new Date().toLocaleString('en-US');

  //This will create a new item called assignedOn which sets the current date its classified on
  closedFields.closedOn = new Date().toLocaleString('en-US');


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















// export functions
export {
  newId,
  connect,
  ping
};

// test the database connection
ping();
