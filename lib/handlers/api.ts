import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda"
import {z, ZodError, ZodSchema } from "zod"



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
                console.log("API_Test About to do Haldler call")
                const res = await handler(body, e)
                console.log("API_Test Done Haldler call")
                return {
                    body: JSON.stringify(res),
                    statusCode : 200
                }
            }catch (error) {

                // zodError

                if(error instanceof ZodError)
                {
                    console.log("API_Test Received Zod Error")
                    return{
                        statusCode : 400,
                        body: error.errors.reduce((a, c) => {
                            a += '${c.path} - ${c.message}, ';
                            return a;
                        }, ""),
                    };
                }

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