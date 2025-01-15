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
    files : z.object({
        "720p" : z.string().optional(),
        "360p" : z.string().optional(),
        "240p" : z.string().optional(),
    }).optional(),
});

export const createDoc = (props: z.infer<typeof docSchema>) => {
return props;
};

type DocSchemaType = z.infer<typeof docSchema> & { id: string };

export class VideoDB extends DB<DocSchemaType> {};