"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3 {
    constructor(config) {
        this.config = config;
        this.client = new client_s3_1.S3Client({
            region: config.region
        });
    }
    getUploadUrl({ key, expiresIn }) {
        console.log("NaveenAwsLog - Inside s3ts - getUploadUrl func");
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, new client_s3_1.PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: key,
        }), { expiresIn });
    }
}
exports.S3 = S3;
