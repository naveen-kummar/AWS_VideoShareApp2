import {APIGatewayProxyHandler} from 'aws-lambda';
import {DB} from '../lib/db';

const db = new DB();

export const handler: APIGatewayProxyHandler = async (e) => {
    const body = JSON.parse(e.body || "{}");

    if(!body.userId || !body.title){
        return {
            body: "Something went wrong",
            statusCode: 400,
        };
    }

    db.save();

    return {
        body: "Success!!",
        statusCode: 200,
    };
};