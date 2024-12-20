//import {APIGatewayProxyHandler} from 'aws-lambda';
import {DB} from '../lib/db';
import {S3} from '../lib/s3'
import {v4} from 'uuid';
import {z} from 'zod';
import { createDoc as createVideoDoc } from '../entity/video';
import { withBodyValidation } from '../lib/handlers/api';


const db = new DB({
    region: "ap-south-1",
    tableName: "vidshare-video",
});
const s3 = new S3({
    bucketName : "vidshare-upload-bucket-naveen",
    region : 'ap-south-1'
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

    await db.save(createVideoDoc({
        id ,
        status: 'NOT_UPLOADED',
        title,
        userId,
        uploadTime: Date.now(),
        description,
        tags,
    }));

    return {
        uploadUrl : await s3.getUploadUrl({
            key : id,
            expiresIn : 60 * 10
        })
    }
}
})

