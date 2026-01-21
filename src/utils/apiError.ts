// @ decs   This class is responsible for operation errors (errors that i can predict)
class ApiError extends Error {
    statusCode: number;
    status: string;
    operational: boolean;
    
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.operational = true
    }
}

export default ApiError;