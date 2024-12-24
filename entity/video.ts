import {z} from "zod";
import {DB} from "../lib/db"

export const docSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    uploadTime: z.number(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["NOT_UPLOADED", "UPLOADED", "PROCESSING", "READY"]),
});

export const createDoc = (props: z.infer<typeof docSchema>) => {
return props;
};
p
type DocSchemaType = z.infer<typeof docSchema>;

export class VideoDB extends DB<z.infer<typeof docSchema>> {};