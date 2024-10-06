import {APIGatewayProxyHandler} from 'aws-lambda';


export const handler: APIGatewayProxyHandler = async (e) => {

    return {body: "Something went wrong",
        statusCode: 400,
    };
};