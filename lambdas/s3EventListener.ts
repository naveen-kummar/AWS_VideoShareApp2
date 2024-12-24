
import { VideoDB } from '../entity/video';
import {S3Handler} from 'aws-lambda'


const videoDB = new VideoDB({
    region: "ap-south-1",
    tableName:  "test-table",
});

export const handler: S3Handler = async (e) => {

    console.log("Inside handler of s3");
    videoDB.update({
        id: "",
        attrs: {},
    });
};