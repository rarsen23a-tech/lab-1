type UpdateUserRequest = {
    name?: unknown;
    email?: unknown;
};

class UpdateUserRequestDto {
    public name?: string;
    public email?: string;

    constructor(data: UpdateUserRequest = {}) {
        this.name = typeof data.name === 'string' ? data.name.trim() : undefined;
        this.email = typeof data.email === 'string' ? data.email.trim() : undefined;
    }
}

export default UpdateUserRequestDto;
