import { validationResult } from "express-validator";

// @desc  Finds the validation errors in the request and wraps them in an object with handy functions
const validatorMiddleware = (req : any, res : any, next : any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

export default validatorMiddleware;
