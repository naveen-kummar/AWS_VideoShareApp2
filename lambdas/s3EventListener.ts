
import { VideoDB } from '../entity/video';
import {S3Handler} from 'aws-lambda'


const videoDB = new VideoDB({
    region: "ap-south-1",
    tableName:  "test-table",
});

export const handler: S3Handler = async (e) => {
    const id = e.Records[0].s3.object.key;
    if (id) {
        console.log("Inside handler of s3 and id is ", id);
      } else {
        console.error("Key not found in the event");
      }
    videoDB.update({
        id,
        attrs: {
            status: "UPLOADED"
        },
    });
};