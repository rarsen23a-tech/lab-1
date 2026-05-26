type User = {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    createdAt?: unknown;
};

class UserResponseDto {
    public id: number;
    public name: string;
    public email: string | null;
    public createdAt: string;

    constructor(user: User = {}) {
        this.id = typeof user.id === 'number' ? user.id : 0;
        this.name = typeof user.name === 'string' ? user.name : '';
        this.email = typeof user.email === 'string' ? user.email : null;
        this.createdAt = typeof user.createdAt === 'string' ? user.createdAt : '';
    }
}

export default UserResponseDto;
