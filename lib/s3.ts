import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export class S3{

    private client: S3Client;

    constructor(
        private config : {
            region: string,
            bucketName: string
        }
    )   {
        this.client = new S3Client({
            region : config.region
        });
    }

    getUploadUrl({key, expiresIn} : {
        key : string,
        expiresIn : number
    }) {
        console.log("NaveenAwsLog - Inside s3ts - getUploadUrl func");
        
        return getSignedUrl(
        this.client, 
        new PutObjectCommand({
            Bucket : this.config.bucketName,
            Key : key,
        }), {expiresIn})
    }

    getDownloadUrl({key, expiresIn} : {
        key : string,
        expiresIn : number
    }) {
        console.log("NaveenAwsLog - Inside s3ts - getUploadUrl func");
        
        return getSignedUrl(
        this.client, 
        new GetObjectCommand({
            Bucket : this.config.bucketName,
            Key : key,
        }), {expiresIn})
    }    
}
