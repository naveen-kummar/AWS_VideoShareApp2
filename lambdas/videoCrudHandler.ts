//import {APIGatewayProxyHandler} from 'aws-lambda';
import {S3} from '../lib/s3'
import {v4} from 'uuid';
import {z} from 'zod';
import { VideoDB} from '../entity/video';
import { withBodyValidation } from '../lib/handlers/api';
import {PutHandler as Env} from "../lib/lambdaEnv"

const env = process.env as Env

const videoDB = new VideoDB({
    region: env.VIDEO_TABLE_REGION || "ap-south-1",
    tableName: env.VIDEO_TABLE_NAME || "test-table",
});
const s3 = new S3({
    bucketName : env.UPLOAD_BUCKET_NAME || "test-bucket",
    region : env.UPLOAD_BUCKET_REGION || 'ap-south-1'
});


export const handler = withBodyValidation({
schema :  z.object({
    userId : z.string(),
    title : z.string(),
    description : z.string().optional(),
    tags : z.array(z.string()).optional()
}),
async handler({title, userId, description, tags}){

    console.log("NaveenAwsLog - Inside putHandlerts - handler func");

    const id = v4();

    await videoDB.save({
        id ,
        status: 'NOT_UPLOADED',
        title,
        userId,
        uploadTime: Date.now(),
        description,
        tags,
    });

    return {
        uploadUrl : await s3.getUploadUrl({
            key : id,
            expiresIn : 60 * 10
        })
    }
}
})

