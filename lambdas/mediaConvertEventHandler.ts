

  import { EventBridgeHandler } from "aws-lambda";
  import { VideoDB } from "../entity/video";
  import { S3 } from "../lib/s3"

  const videoDb = new VideoDB({
    region : "ap-south-1",
    tableName : "test-table"
  });

  const uploadBucket = new S3({
    bucketName : "test-bucket",
    region : "ap-south-1"
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