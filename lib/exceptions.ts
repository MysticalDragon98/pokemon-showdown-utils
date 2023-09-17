import { ok } from "assert";

export class CustomError extends Error {
    code: string;
    
    constructor(message, code) {
        super(message); // Call the parent constructor with the message parameter
        this.code = code; // Add a custom code property
        this.name = this.constructor.name; // Set the error name to the class name (optional but recommended)
        (<any>Error).captureStackTrace(this, this.constructor); // Capture the correct stack trace (optional but recommended)
    }
}

export const $ok = (expression: any, code: string, message: string) => {
    ok(expression, new CustomError(code, message));

    return expression;
}