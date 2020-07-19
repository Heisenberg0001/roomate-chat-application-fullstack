export function storeToken(token: string) {
    localStorage.setItem("accessToken", token);
}
export function getToken(): string {
    const token = localStorage.getItem("accessToken");

    return token ? token : null;
}
