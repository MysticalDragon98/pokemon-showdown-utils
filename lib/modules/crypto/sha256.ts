import crypto from "crypto";
export function sha256 (data: any, key: string = "") {
    let hmac;
    
    if(data instanceof Buffer) {
        hmac = crypto.createHmac('sha256', key).update(data).digest('hex');
    } else {
        hmac = crypto.createHmac('sha256', key).update(JSON.stringify(data)).digest('hex');
    }

    return hmac;
}