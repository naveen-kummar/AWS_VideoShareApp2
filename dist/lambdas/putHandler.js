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
exports.handler = void 0;
//import {APIGatewayProxyHandler} from 'aws-lambda';
const db_1 = require("../lib/db");
const s3_1 = require("../lib/s3");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const video_1 = require("../entity/video");
const api_1 = require("../lib/handlers/api");
const db = new db_1.DB({
    region: process.env.VIDEO_TABLE_REGION,
    tableName: process.env.VIDEO_TABLE_NAME,
});
const s3 = new s3_1.S3({
    bucketName: process.env.UPLOAD_BUCKET_NAME,
    region: process.env.UPLOAD_BUCKET_REGION
});
exports.handler = (0, api_1.withBodyValidation)({
    schema: zod_1.z.object({
        userId: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional()
    }),
    handler(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, userId, description, tags }) {
            console.log("NaveenAwsLog - Inside putHandlerts - handler func");
            const id = (0, uuid_1.v4)();
            yield db.save((0, video_1.createDoc)({
                id,
                status: 'NOT_UPLOADED',
                title,
                userId,
                uploadTime: Date.now(),
                description,
                tags,
            }));
            return {
                uploadUrl: yield s3.getUploadUrl({
                    key: id,
                    expiresIn: 60 * 10
                })
            };
        });
    }
});
