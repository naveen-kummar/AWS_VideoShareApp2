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

type PartialAttrs = Partial<Omit<z.infer<typeof docSchema>, "id">>
export class VideoDB extends DB<DocSchemaType> {
    changes: PartialAttrs = {}
    collectChanges(attrs : PartialAttrs){
        this.changes = {
            ...this.changes,
            ...attrs
        };
    }

    addFiles(files: PartialAttrs["files"]){
        console.log("Inside VideoDB addFiles ");
        this.changes.files = {
            ...this.changes.files,
            ...files,
        };
    }
};