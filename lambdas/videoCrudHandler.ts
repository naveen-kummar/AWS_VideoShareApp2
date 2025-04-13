//import {APIGatewayProxyHandler} from 'aws-lambda';
import {S3} from '../lib/s3'
import {v4} from 'uuid';
import {z} from 'zod';
import { VideoDB} from '../entity/video';
import { withValidation } from '../lib/handlers/api';
import {PutHandler as Env} from "../lib/lambdaEnv"
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

    console.log("Inside APIGatewayProxyHandler 1");
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

    }
           
}
