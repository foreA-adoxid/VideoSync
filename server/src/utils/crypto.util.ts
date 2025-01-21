import { AES, enc, HmacMD5, lib, MD5, mode, pad } from 'crypto-js'
import * as dotenv from 'dotenv'

dotenv.config()

export class aes {
    static encrypt(data: any): string {
        try {
            const iv = lib.WordArray.random(16)

            const encrypted = AES.encrypt(
                JSON.stringify(data),
                enc.Utf8.parse(process.env.SECRET_TOKEN),
                {
                    iv: iv,
                    mode: mode.CBC,
                    padding: pad.Pkcs7,
                },
            )

            return iv.concat(encrypted.ciphertext).toString(enc.Base64)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    static decrypt(encryptedData: string): any {
        try {
            const encryptedWordArray = enc.Base64.parse(encryptedData)

            const iv = lib.WordArray.create(encryptedWordArray.words.slice(0, 4))

            const ciphertext = lib.WordArray.create(
                encryptedWordArray.words.slice(4),
                encryptedWordArray.sigBytes - 16,
            )

            const cipherParams = lib.CipherParams.create({
                ciphertext: ciphertext,
            })

            const decrypted = AES.decrypt(
                cipherParams,
                enc.Utf8.parse(process.env.SECRET_TOKEN),
                {
                    iv: iv,
                    mode: mode.CBC,
                    padding: pad.Pkcs7,
                },
            )

            return JSON.parse(decrypted.toString(enc.Utf8))
        } catch (error) {
            return null
        }
    }
}
export class md5 {
    static hash(key: any) {
        return HmacMD5(key, process.env.SECRET_TOKEN).toString()
    }

    static hashFile(key: Buffer) {
        return MD5(key.toString()).toString()
    }

    static verify(password: string, hash: string) {
        const passwordHash = HmacMD5(password, process.env.SECRET_TOKEN).toString()

        return hash === passwordHash
    }
}
