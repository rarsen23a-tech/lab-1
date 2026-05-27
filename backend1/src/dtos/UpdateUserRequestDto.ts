type UpdateUserRequest = {
    name?: unknown;
    email?: unknown;
    username?: unknown;
    role?: unknown;
};

class UpdateUserRequestDto {
    public name?: string;
    public email?: string;
    public username?: string;
    public role?: string;

    constructor(data: UpdateUserRequest = {}) {
        this.name = typeof data.name === 'string' ? data.name.trim() : undefined;
        this.email = typeof data.email === 'string' ? data.email.trim() : undefined;
        this.username = typeof data.username === 'string' ? data.username.trim() : undefined;
        this.role = typeof data.role === 'string' ? data.role.trim() : undefined;
    }
}

export default UpdateUserRequestDto;
