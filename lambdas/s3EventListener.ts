
import { VideoDB } from '../entity/video';
import {S3Handler} from 'aws-lambda'
import {S3EventListener as Env} from '../lib/lambdaEnv'
import {VideoMetadata} from '../lib/video-metadata'
import { VideoConverter } from '../lib/video-converter'
import {S3} from '../lib/s3'

const env = process.env as Env;

const videoDB = new VideoDB({
    region: env.VIDEO_TABLE_REGION,
    tableName:  env.VIDEO_TABLE_NAME,
});

const videoMetadata = new VideoMetadata({
  mediaInfoCliPath : env.MEDIA_INFO_CLI_PATH,
});
const videoConverter = new VideoConverter();
const uploadBucket = new S3({
  bucketName : "test",
  region : 'ap-south-1'
});

export const handler: S3Handler = async (e) => {
    const id = e.Records[0].s3.object.key;
    if (id) {
        console.log("Inside handler of s3 and id is ", id);
      } else {
        console.error("Key not found in the event");
      }

    //1. Update Dynamo DB table when video is uploaded to the s3 bucket for a specific id
    await videoDB.update({
        id,
        attrs: {
            status: "UPLOADED"
        },
    });

    //2. Get downloaded url for the uploaded video
   const metadata = await videoMetadata.frommUrl(
    await uploadBucket.getDownloadUrl({
      key: id,
      expiresIn: 2 * 60,
    })
   );

   //3. Add resolution(s) to the uploaded video
   if(metadata.width >= 1280)
   {
    videoConverter.addResolution({
      width: 1280,
      height: 720,
     });
   }

   if(metadata.width >= 640)
    {
      videoConverter.addResolution({
        width: 640,
        height: 360,
       }); 
    }
    else
    {
      videoConverter.addResolution({
        width: metadata.width,
        height: metadata.height,
       }); 
    }
  

};