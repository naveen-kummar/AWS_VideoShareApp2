import {APIGatewayProxyHandler} from 'aws-lambda';

import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb"
import {v4} from "uuid";
const ddbClient = new DynamoDBClient({ region: "ap-south-1" });

export const handler: APIGatewayProxyHandler = async (e) => {
 const {userId} = JSON.parse(e.body || "{}");

 const Item = {
    id: v4(),
    userId,
    uploadedTime: Date.now(),
};
 await ddbClient.send(
    new PutCommand({
        TableName: "vidshare-video",
        Item,
    })
);
 return{
    statusCode: 200,
    body: JSON.stringify(Item),
 };
};