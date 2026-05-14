type CreateUserRequest = {
    name?: unknown;
};

class CreateUserRequestDto {
    public name: string;

    constructor(data: CreateUserRequest) {
        this.name =
            typeof data.name === 'string'
                ? data.name.trim()
                : '';
    }
}

export default CreateUserRequestDto;