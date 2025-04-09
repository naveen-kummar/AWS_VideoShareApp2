

  import { EventBridgeHandler } from "aws-lambda";
  import { VideoDB } from "../entity/video";
  import { S3 } from "../lib/s3"
  import { MediaConvertEventHandler as Env} from "../lib/lambdaEnv"

  const env = process.env as Env

  const videoDb = new VideoDB({
    region : env.VIDEO_TABLE_REGION || "ap-south-1",
    tableName : env.VIDEO_TABLE_NAME || "test-table"
  });

  const uploadBucket = new S3({
    bucketName : env.UPLOAD_BUCKET_NAME || "test-bucket",
    region : env.UPLOAD_BUCKET_REGION || "ap-south-1"
  })

  export const handler: EventBridgeHandler<
    "", 
    {
        status : "PROGRESSING" | "COMPLETE" | "ERROR",
        userMetadata : {
            id : string
        }
    }, 
    any
> = async (e) => {

    const id = e.detail.userMetadata.id
    const status = e.detail.status

    switch (status) {
        case "COMPLETE":
            await videoDb.update({
                id: e.detail.userMetadata.id,
                attrs: {
                    status: "READY"
                },
            });
        uploadBucket.deleteObject(id);
        break;
        case "PROGRESSING":
            await videoDb.update({
                id: e.detail.userMetadata.id,
                attrs: {
                    status: "PROCESSING"
                },
            });           
        break;     
        case "ERROR":
            await videoDb.update({
                id: e.detail.userMetadata.id,
                attrs: {
                    status: "ERROR"
                },
            }); 
            uploadBucket.deleteObject(id);                   
    }
};