type CreateUserRequest = {
    name?: unknown;
    email?: unknown;
};

class CreateUserRequestDto {
    public name: string;
    public email: string | undefined;

    constructor(data: CreateUserRequest) {
        this.name = typeof data.name === 'string' ? data.name.trim() : '';
        this.email = typeof data.email === 'string' ? data.email.trim() : undefined;
    }
}

export default CreateUserRequestDto;
