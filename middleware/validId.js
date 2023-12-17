

import { ObjectId } from "mongodb";


const validId = (parameterName) => {


  return (req,res,next) => {
    try {
      // console.log(`Received ${parameterName}:`, req.params[parameterName]);

      // Creating a dynamic property with the name of whatever is passed in parameterName
      req[parameterName] = new ObjectId(req.params[parameterName]); // Using brackets here due to us not knowin what will be passed into it.

      return next();
    } catch (err) {
      return res.status(400).json({error: `${parameterName} Does Not Contain a Valid Id`});

    }
  }



};


export { validId };