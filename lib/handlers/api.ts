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
         console.log("Inside apits - withBodyValidation - 1");
        const apiGatewayProxyHandler: APIGatewayProxyHandler = async (e)=> {

            try{
                const eData = JSON.parse(e.body || "{}");
                const body = schema.parse(JSON.parse(e.body || "{}"))
                const res = await handler(body, e)
                console.log("Inside apits - withBodyValidation - 2");
                return {
                    body: JSON.stringify(res),
                    statusCode : 200
                }
            }catch (error) {

                // zodError

                if(error instanceof ZodError)
                {
                    return{
                        statusCode : 400,
                        body: error.errors.reduce((a, c) => {
                             a += `${c.path} - ${c.message}, `;  // Template literal
                            return a;
                        }, ""),
                    };
                }

                // known error

                // unknown error
                console.log(error);

                return {
                    body: "Something went wrong",
                    statusCode: 500,
                };

            }

        }

        return apiGatewayProxyHandler
}