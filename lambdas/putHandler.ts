import {APIGatewayProxyHandler} from 'aws-lambda';
import {DB} from '../lib/db';
import {z} from "zod";

const db = new DB();

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
        db.save(dbInput);
        return {
            body: "Success!!",
            statusCode: 200,
        };
    }catch (error){
        return {
            body: "Something went wrong",
            statusCode: 400,
        };
    }


};