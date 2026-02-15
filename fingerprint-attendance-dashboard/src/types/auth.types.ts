export interface User {
    id: string;
    username: string;
    role: string;
    // Add other user properties as needed
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    user: User;
}
