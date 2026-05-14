type User = {
    id?: unknown;
    name?: unknown;
};

class UserResponseDto {
    public id: number;
    public name: string;

    constructor(user: User = {}) {
        this.id =
            typeof user.id === 'number'
                ? user.id
                : 0;

        this.name =
            typeof user.name === 'string'
                ? user.name
                : '';
    }
}

export default UserResponseDto;