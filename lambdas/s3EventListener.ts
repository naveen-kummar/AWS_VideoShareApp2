
import { VideoDB } from '../entity/video';
import {S3Handler} from 'aws-lambda'
import {S3EventListener as Env} from '../lib/lambdaEnv'
import {VideoMetadata} from '../lib/video-metadata'
import { VideoConverter } from '../lib/video-converter'
import {S3} from '../lib/s3'

const env = process.env as Env;

const videoMetadata = new VideoMetadata({
  mediaInfoCliPath : env.MEDIA_INFO_CLI_PATH,
});

const uploadBucket = new S3({
  bucketName : env.UPLOAD_BUCKET_NAME || "test-bucket",
  region : env.UPLOAD_BUCKET_REGION || "ap-south-1"
});

export const handler: S3Handler = async (e) => {

  const videoDB = new VideoDB({
    region: env.VIDEO_TABLE_REGION || "test-table",
    tableName:  env.VIDEO_TABLE_NAME || "ap-south-1",
  });

    const id = e.Records[0].s3.object.key;
    if (id) {
        //console.log("Inside handler of s3 and id is ", id);
      } else {
        //console.error("Key not found in the event");
      }

    //1. Update Dynamo DB table when video is uploaded to the s3 bucket for a specific id
     videoDB.collectChanges({
        status : "UPLOADED"
    });

    //2. Get downloaded url for the uploaded video
   const metadata = await videoMetadata.frommUrl(
    await uploadBucket.getDownloadUrl({
      key: id,
      expiresIn: 2 * 60,
    })
   );

   console.log("Received metadata.widt as ", metadata.width);

   const videoConverter = new VideoConverter({
    endpoint: env.MEDIA_CONVERT_ENDPOINT,
    region: env.MEDIA_CONVERT_REGION,
    roleArn: env.MEDIA_CONVERT_ROLE_ARN,
    inputFile: `s3://${env.UPLOAD_BUCKET_NAME}/${id}`,
    outputFile: `s3://${env.MEDIA_CONVERT_OUTPUT_BUCKET}/${id}`,
    userMetadata: {id,}
   });

   //3. Add resolution(s) to the uploaded video
   if(metadata.width >= 1280)
   {
    //console.log("Calling addResolution func for 1280");
    videoConverter.addResolution4(
    {
      width: 1280,
      height: 720,
      bitRate: 500000,
      nameExtension: "_720p",
    }
    );

    console.log("Calling collectChanges_2 for _720 for vide width of ", metadata.width);

    videoDB.addFiles(
      {
        "720p": `https://${env.MEDIA_CONVERT_OUTPUT_BUCKET}.s3.amazonaws.com/${id}_720p.mp4`
      });

   }
   else
   {
    //console.log("Skipped Calling addResolution func for 1280");
   }

   if(metadata.width >= 640)
    {
      //console.log("Calling addResolution func for 640");
      videoConverter.addResolution4(
      {
        width: 640,
        height: 360,
        bitRate: 100000,
        nameExtension: "_360p",
       }
      ); 

      videoDB.addFiles(
        {
          "360p": `https://${env.MEDIA_CONVERT_OUTPUT_BUCKET}.s3.amazonaws.com/${id}_360p.mp4`
        });
    }
    else
    {
      //console.log("Calling addResolution func for as it is");
      videoConverter.addResolution4(
        {
        width: metadata.width,
        height: metadata.height,
        bitRate: 100000,
        nameExtension: "_240p",
       }); 

       videoDB.addFiles(
        {
          "240p": `https://${env.MEDIA_CONVERT_OUTPUT_BUCKET}.s3.amazonaws.com/${id}_240p.mp4`
        });
    }
  
    await videoDB.update({
      id,
      attrs: videoDB.changes,
    });
    console.log("About to call videoConverter.convert_3 ");
    await videoConverter.convert();
    //await videoConverter.convert2.call(videoConverter);
    console.log("Done call to videoConverter.convert ");

    //console.log("Is addResolution2 defined?", typeof videoConverter.addResolution2 === "function");

};