class HttpException {
    constructor(
        private readonly statusCode: number,
        private readonly message?: string,
    ) {}

    public toResponse(): { ok: boolean; statusCode: number; message: string } {
        return {
            ok: false,
            statusCode: this.statusCode,
            message: this.message || 'An error occurred',
        }
    }
}

export default HttpException
