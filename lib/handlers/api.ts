import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda"
import {z, ZodSchema } from "zod"



/*
withBodyValidation: Below is a function which returns 
APIGatewayProxyHandler, Again which is an another function

Input: schema - Zod Schema
       handler - Main Handler which will be trihggerred by AWS Lambda upon the API PUT Call
*/
export const withBodyValidation = <T extends ZodSchema>({schema, handler} : {
    schema: T,
    handler: (body: z.infer<T>, e: APIGatewayEvent) => Promise<any>
}) => {
        const apiGatewayProxyHandler: APIGatewayProxyHandler = async (e)=> {

            try{
                const body = schema.parse(JSON.parse(e.body || "{}"))
                const res = await handler(body, e)
                return {
                    body: JSON.stringify(e),
                    statusCode : 200
                }
            }catch (error) {
                // zodError

                // known error

                // unknown error

                return {
                    body: "Something went wrong",
                    statusCode: 400,
                };

            }

        }

        return apiGatewayProxyHandler
}