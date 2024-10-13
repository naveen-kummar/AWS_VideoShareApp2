import {APIGatewayProxyHandler} from 'aws-lambda';
import {DB} from '../lib/db';
import {S3} from '../lib/s3'
import {v4} from "uuid";
import {z} from "zod";
import { createDoc as createVideoDoc } from '../entity/video';

const db = new DB({
    region: "ap-south-1",
    tableName: "vidshare-video",
});
const s3 = new S3();

const bodySchema = z.object({
    userId : z.string(),
    title : z.string(),
    description : z.string().optional(),
    tags : z.array(z.string()).optional()
})

export const handler: APIGatewayProxyHandler = async (e) => {
    const body = JSON.parse(e.body || "{}");

    try {
        const {title, userId, description, tags} = bodySchema.parse(body);
        
        await db.save(createVideoDoc({
            id : v4(),
            status: 'NOT_UPLOADED',
            title,
            userId,
            uploadTime: Date.now(),
            description,
            tags,
        }));
        const uploadUrl = s3.getUploadUrl();

        return {
            statusCode: 200,
            body : JSON.stringify({
                uploadUrl,
            }),
        };
    }catch (error){
        return {
            body: "Something went wrong",
            statusCode: 400,
        };
    }


};