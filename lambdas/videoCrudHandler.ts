//import {APIGatewayProxyHandler} from 'aws-lambda';
import { KnownError } from '../lib/error';
import {S3} from '../lib/s3'
import {v4} from 'uuid';
import {z} from 'zod';
import { VideoDB} from '../entity/video';
import { withValidation } from '../lib/handlers/api';
import {videoCrudHandler as Env} from "../lib/lambdaEnv"
import { APIGatewayProxyHandler } from "aws-lambda";


const env = process.env as Env

const videoDB = new VideoDB({
    region: env.VIDEO_TABLE_REGION || "ap-south-1",
    tableName: env.VIDEO_TABLE_NAME || "test-table",
});
const s3 = new S3({
    bucketName : env.UPLOAD_BUCKET_NAME || "test-bucket",
    region : env.UPLOAD_BUCKET_REGION || 'ap-south-1'
});

export const handler: APIGatewayProxyHandler = (...params) => {

    console.log("Inside APIGatewayProxyHandler Ax");
    console.log("Inside APIGatewayProxyHandler Aa - " , params[0].httpMethod);
    switch(params[0].httpMethod){
    
    case "PUT":
        return withValidation({
            bodySchema :  z.object({
                userId : z.string(),
                title : z.string(),
                description : z.string().optional(),
                tags : z.array(z.string()).optional()
            }),
            async handler({title, userId, description, tags}){
            
                console.log("Inside APIGatewayProxyHandler 2");
            
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

                console.log("Inside APIGatewayProxyHandler 3");
            
                return {
                    uploadUrl : await s3.getUploadUrl({
                        key : id,
                        expiresIn : 60 * 10
                    })
                }

                console.log("Inside videoCrudHandlerTS-->PUT - 4");
            }
            })(...params);

    case "GET":
        console.log("Inside videoCrudHandlerTS-->GET - 1");
        return withValidation({
            querySchema: z.union([
                z.object({id: z.string(), userId: z.string().optional()}),
                z.object({userId: z.string(), id: z.string().optional()}),],
                {
                    errorMap: () => ({
                        message: "query cannot be empty, pass userid or id",
                    }),
                }),
            async handler (_, queries){

                console.log("Inside videoCrudHandlerTS-->GET - 2");
                if(queries.id)
                {
                    console.log("Inside videoCrudHandlerTS-->GET - 3");
                    const res = await videoDB.get(queries.id);
                    if(!res) throw new KnownError(404, "Video not Found");
                    return res;
                }

                if(queries.userId)
                {
                    return videoDB.getByUserId(queries.userId); 
                }
            },
        })(...params);    
    
    default:
        break;
    }
           
}
