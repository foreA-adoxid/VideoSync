function getUserIP(req: any): string {
    let ipAddress = req.headers['cf-connecting-ip'] || req.socket.remoteAddress
    if (ipAddress === '::1') {
        ipAddress = '127.0.0.1'
    }
    if (
        ipAddress &&
        typeof ipAddress === 'string' &&
        ipAddress.substring(0, 7) === '::ffff:'
    ) {
        ipAddress = ipAddress.substring(7)
    }
    return ipAddress as string
}
export default getUserIP
