"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoc = void 0;
const zod_1 = require("zod");
const docSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    uploadTime: zod_1.z.number(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["NOT_UPLOADED", "UPLOADED", "PROCESSING", "READY"]),
});
const createDoc = (props) => {
    return props;
};
exports.createDoc = createDoc;
