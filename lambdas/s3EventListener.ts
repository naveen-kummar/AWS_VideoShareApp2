
import { VideoDB } from '../entity/video';
import {S3Handler} from 'aws-lambda'
import {S3EventListener as Env} from '../lib/lambdaEnv'

const env = process.env as Env;

const videoDB = new VideoDB({
    region: env.VIDEO_TABLE_REGION,
    tableName:  env.VIDEO_TABLE_NAME,
});

export const handler: S3Handler = async (e) => {
    const id = e.Records[0].s3.object.key;
    if (id) {
        console.log("Inside handler of s3 and id is ", id);
      } else {
        console.error("Key not found in the event");
      }
    await videoDB.update({
        id,
        attrs: {
            status: "UPLOADED"
        },
    });
};