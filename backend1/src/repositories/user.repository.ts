type User = {
    id: number;
    name: string;
};

type CreateUserInput = {
    name: string;
};

type UpdateUserInput = {
    name?: string;
};

const users: User[] = [];
let id = 1;

const toId = (value: number | string): number => Number(value);

export const getAll = (): User[] => {
    return users;
};

export const getById = (userId: number | string): User | undefined => {
    return users.find(u => u.id === toId(userId));
};

export const create = (data: CreateUserInput): User => {
    const name = data.name.trim();

    const user: User = {
        id: id++,
        name
    };

    users.push(user);
    return user;
};

export const update = (
    userId: number | string,
    data: UpdateUserInput
): User | null => {
    const index = users.findIndex(u => u.id === toId(userId));

    if (index === -1) return null;

    users[index] = {
        ...users[index],
        name: data.name !== undefined
            ? data.name.trim()
            : users[index].name
    };

    return users[index];
};

export const remove = (userId: number | string): boolean => {
    const index = users.findIndex(u => u.id === toId(userId));

    if (index === -1) return false;

    users.splice(index, 1);
    return true;
};