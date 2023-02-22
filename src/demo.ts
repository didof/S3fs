import { S3Client } from "@aws-sdk/client-s3"
import to from "await-to-js"
import S3FS from "."


const client = new S3Client({
    region: "localhost",
    endpoint: "http://127.0.0.1:9000",
    credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin"
    }
})

const fs = new S3FS(client);

(async () => {
    const [err, folder] = await to(fs.loadFolder("root", "/"))
    if (err) throw err
})()