//
const validBody = (schema) => {


  return(req, res, next) => {
    // This plugs in the users input in the body and validates it
    const validationResult = schema.validate(req.body, {abortEarly: false});

    // If there is an error send the error back to user
    if(validationResult.error){
      return res.status(400).json({Error: validationResult.error});
    }
    else{
      // This is the object the user inputs and keeps the body to the good data added
      req.body = validationResult.value;

      next(); // This will call the next middleware function (1st return statement)
    }

  }; // END OF First return

};

export {validBody};