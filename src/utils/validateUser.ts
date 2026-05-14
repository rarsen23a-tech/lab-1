type UserInput = {
    name?: unknown;
};

export const validateUser = (data: UserInput): string[] => {
    const errors: string[] = [];

    const name = data.name;

    if (typeof name !== 'string' || !name.trim()) {
        errors.push('Name is required');
        return errors;
    }

    const trimmed = name.trim();

    if (trimmed.length <= 3) {
        errors.push('Name too short');
    }

    if (!isNaN(Number(trimmed))) {
        errors.push('Name cannot be a number');
    }

    return errors;
};