export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
    myEnum: T,
    enumValue: string
): keyof T | undefined {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : undefined;
}

export enum HTTPStatusCode {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    IM_A_TEAPOT = 418,

    INTERNAL_SERVER_ERROR = 500,
}