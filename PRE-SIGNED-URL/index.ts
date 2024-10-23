import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const handler = async ({bucketRegion, bucketName, key} : {
    bucketRegion : string,
    key : string,
    bucketName : string
}) => {

    const client = new S3Client ({
        region: bucketRegion
    })
    
    const putCommand = new PutObjectCommand({
        Bucket : bucketName,
        Key : key
    })

    const url = await getSignedUrl(client, putCommand, {
        expiresIn: 60*100
    })

    console.log(url);

    return {
        url
    }
}