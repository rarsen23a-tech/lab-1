type UpdateUserRequest = {
    name?: unknown;
};

class UpdateUserRequestDto {
    public name?: string;

    constructor(data: UpdateUserRequest = {}) {
        this.name =
            typeof data.name === 'string'
                ? data.name.trim()
                : undefined;
    }
}

export default UpdateUserRequestDto;