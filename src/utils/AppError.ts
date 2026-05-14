class AppError extends Error {
    status: number;
    code: string;
    details: unknown[];

    constructor(
        status: number,
        message: string,
        details: unknown[] = [],
        code: string = 'ERROR'
    ) {
        super(message);

        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export default AppError;