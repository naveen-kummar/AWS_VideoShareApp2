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
/*
withBodyValidation: Below is a function which returns
APIGatewayProxyHandler, Again which is an another function

Input: schema - Zod Schema
       handler - Main Handler which will be trihggerred by AWS Lambda upon the API PUT Call
*/
const withBodyValidation = ({ schema, handler }) => {
    const apiGatewayProxyHandler = (e) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const body = schema.parse(JSON.parse(e.body || "{}"));
            const res = yield handler(body, e);
            return {
                body: JSON.stringify(e),
                statusCode: 200
            };
        }
        catch (error) {
            // zodError
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
//# sourceMappingURL=api.js.map