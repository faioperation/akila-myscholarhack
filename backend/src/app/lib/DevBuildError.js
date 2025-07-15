class DevBuildError extends Error {
    constructor(message, statusCode) {
        super(message);
        console.log('Error from DevBuildError >' , message)
        this.statusCode = statusCode;
    }
}

export default DevBuildError;