// Reference <https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html>
import { S3Client, ListObjectsCommand, ListObjectsCommandInput, ListObjectsCommandOutput } from "@aws-sdk/client-s3"
import to from "await-to-js"

type BucketName = string
type S3Path = `${string}/`

type S3Folder = {
    path: S3Path
    fs: Map<string, S3Folder>
}

class S3FolderBuilder {
    private readonly fs: Map<string, S3Folder> = new Map()
    constructor(public readonly path: S3Path) { }

    add(...chunks: string[]) {

    }

    freeze(): S3Folder {
        return {
            path: this.path,
            fs: this.fs
        }
    }
}

export default class S3FS {
    constructor(protected client: S3Client) { }

    // Reference <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property>
    public async listAllPaginated(params: ListObjectsCommandInput): Promise<ListObjectsCommandOutput[]> {
        let truncated = true
        const retrieved: ListObjectsCommandOutput[] = []

        // Define the listing query
        const query = async (params: ListObjectsCommandInput): Promise<ListObjectsCommandOutput> => {
            const cmd = new ListObjectsCommand(params)
            const [err, res] = await to(this.client.send(cmd))
            if (err) throw err
            return res
        }

        // Keep listing
        while (truncated) {
            const [err, res] = await to(query(params))
            if (err) {
                truncated = false
                throw err
            }

            truncated = res.IsTruncated || false
            if (truncated) {
                res.Contents?.slice(-1)[0]?.Key
            }

            retrieved.push(res)
        }

        return retrieved
    }

    public async loadFolder(bucket: BucketName, S3Path: S3Path): Promise<S3Folder> {
        const [err, list] = await to(this.listAllPaginated({
            Bucket: bucket,
            Prefix: S3Path
        }))
        if (err) throw err



        const folder = new S3FolderBuilder(`${bucket}/`)

        for (const item of list) {
            // TODO Can it ever return without Contents?
            for (const { Key } of item.Contents || []) {
                // TODO Can it ever return without Key?
                if (!Key) continue
                const chunks = Key.split("/")
                const file = chunks.pop()
            }
        }

        return folder.freeze()
    }
}

