type CreateUserRequest = {
    name?: unknown;
    email?: unknown;
    username?: unknown;
    role?: unknown;
};

class CreateUserRequestDto {
    public name: string;
    public email: string | undefined;
    public username: string | undefined;
    public role: string | undefined;

    constructor(data: CreateUserRequest) {
        this.name = typeof data.name === 'string' ? data.name.trim() : '';
        this.email = typeof data.email === 'string' ? data.email.trim() : undefined;
        this.username = typeof data.username === 'string' ? data.username.trim() : undefined;
        this.role = typeof data.role === 'string' ? data.role.trim() : undefined;
    }
}

export default CreateUserRequestDto;
