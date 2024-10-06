import {APIGatewayProxyHandler} from 'aws-lambda';
import {DB} from '../lib/db';
import {S3} from '../lib/s3'
import {z} from "zod";

const db = new DB();
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
        const {userId} = bodySchema.parse(body);
        const dbInput = {userId}
        await db.save(dbInput);
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