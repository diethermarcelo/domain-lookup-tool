class ParameterError extends Error {
    constructor (public msg: string) {
        super(msg);    
    }
}

class WhoIsAPIResponseError extends Error {
    constructor (public code: number, public message: string) {
        super();    
    }
}

export { WhoIsAPIResponseError, ParameterError }