import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda"
import { KnownError } from "lib/error";
import {z, ZodError, ZodSchema } from "zod"



/*
withValidation: Below is a function which returns 
APIGatewayProxyHandler, Again which is an another function

Input: schema - Zod Schema
       handler - Main Handler which will be trihggerred by AWS Lambda upon the API PUT Call
*/
export const withValidation = <TBody extends ZodSchema,
                                   TQuery extends ZodSchema>({
    handler, bodySchema, querySchema} : 
    {
    bodySchema?: TBody,
    querySchema?: TQuery,
    handler: (body: z.infer<TBody>, queries: z.infer<TQuery>, e: APIGatewayEvent) => Promise<any>
}) => {
         console.log("Inside apits - withValidation - 1");
        const apiGatewayProxyHandler: APIGatewayProxyHandler = async (e)=> {

            try{

                let body = {}
                let queries = {}
                
                if(bodySchema)
                {
                    //Extract "body" contents of AWS event "e"
                    body = bodySchema.parse(JSON.parse(e.body || "{}"));
                }

                if(querySchema)
                {
                    //Extract "queryStringParameters" contents of AWS event "e"
                    queries = querySchema.parse(e.queryStringParameters || {});
                }

                const res = await handler(body, queries, e)
                console.log("Inside apits - withValidation - 2");
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
                if(error instanceof KnownError)
                {
                    return {
                        body: error.message,
                        statusCode: error.code,
                    };
                }

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