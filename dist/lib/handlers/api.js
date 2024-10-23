"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withBodyValidation = void 0;
const zod_1 = require("zod");
/*
withBodyValidation: Below is a function which returns
APIGatewayProxyHandler, Again which is an another function

Input: schema - Zod Schema
       handler - Main Handler which will be trihggerred by AWS Lambda upon the API PUT Call
*/
const withBodyValidation = ({ schema, handler }) => {
    console.log("API_Test Just entered withBodyValidation");
    const apiGatewayProxyHandler = (e) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("API_Test About to eData");
            const eData = JSON.parse(e.body || "{}");
            console.log(eData);
            console.log("API_Test About to parse schema");
            const body = schema.parse(JSON.parse(e.body || "{}"));
            console.log("API_Test About to do Haldler call");
            const res = yield handler(body, e);
            console.log("API_Test Done Haldler call");
            return {
                body: JSON.stringify(res),
                statusCode: 200
            };
        }
        catch (error) {
            // zodError
            if (error instanceof zod_1.ZodError) {
                console.log("API_Test Received Zod Error");
                return {
                    statusCode: 400,
                    body: error.errors.reduce((a, c) => {
                        console.log(c);
                        a += '${c.path} - ${c.message}, ';
                        console.log(a);
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
    });
    return apiGatewayProxyHandler;
};
exports.withBodyValidation = withBodyValidation;
