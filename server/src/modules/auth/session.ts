export default interface Session {
    uuid: string
    ip: string
    ua: string
    userId: string
    expiresIn: number
    closed: boolean
}
