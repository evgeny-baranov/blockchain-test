export function replaceBigInt(data: any): any {
    if (Array.isArray(data)) {
        return data.map(item => replaceBigInt(item));
    } else if (typeof data === 'bigint') {
        return data.toString();
    } else if (typeof data === 'object' && data !== null) {
        const newObj: any = {};
        for (const key of Object.keys(data)) {
            const value = data[key];

            if (typeof value === 'bigint') {
                newObj[key] = value.toString();
            } else if (typeof value === 'object') {
                newObj[key] = replaceBigInt(value);
            } else {
                newObj[key] = value;
            }
        }
        return newObj;
    } else {
        return data;
    }
}
