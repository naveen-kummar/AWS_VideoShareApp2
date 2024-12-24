
/*
TODO:

- Update Video status to be UPLOADED
- Processing the Video file

*/
import {DB} from "../../lib/db";
import { VideoDB } from '../../entity/video'
import { handler } from '../s3EventListener';

function getEvent(bucketname: string, key: string){
    console.log("Inside getEvent of s3EventListner_Test");
    return {  
        "Records":[  
           {  
              "eventVersion":"2.2",
              "eventSource":"aws:s3",
              "awsRegion":"us-west-2",
              "eventTime":"The time, in ISO-8601 format, for example, 1970-01-01T00:00:00.000Z, when Amazon S3 finished processing the request",
              "eventName":"event-type",
              "userIdentity":{  
                 "principalId":"Amazon-customer-ID-of-the-user-who-caused-the-event"
              },
              "requestParameters":{  
                 "sourceIPAddress":"ip-address-where-request-came-from"
              },
              "responseElements":{  
                 "x-amz-request-id":"Amazon S3 generated request ID",
                 "x-amz-id-2":"Amazon S3 host that processed the request"
              },
              "s3":{  
                 "s3SchemaVersion":"1.0",
                 "configurationId":"ID found in the bucket notification configuration",
                 "bucket":{  
                    "name":bucketname,
                    "ownerIdentity":{  
                       "principalId":"Amazon-customer-ID-of-the-bucket-owner"
                    },
                    "arn":"bucket-ARN"
                 },
                 "object":{  
                    "key":key,
                    "size":"object-size in bytes",
                    "eTag":"object eTag",
                    "versionId":"object version if bucket is versioning-enabled, otherwise null",
                    "sequencer": "a string representation of a hexadecimal value used to determine event sequence, only used with PUTs and DELETEs"
                 }
              },
              "glacierEventData": {
                 "restoreEventData": {
                    "lifecycleRestorationExpiryTime": "The time, in ISO-8601 format, for example, 1970-01-01T00:00:00.000Z, of Restore Expiry",
                    "lifecycleRestoreStorageClass": "Source storage class for restore"
                 }
              }
           }
        ]
     }
}

describe ("Tests for S3EventListener", () => {
    test("It should call the update method withthe correct metadata", async () => {
        //Let's create a spy
        const mockUpdate = jest.spyOn(VideoDB.prototype, "update");
        
        const res = await (handler as any)(getEvent("test-bucket", "id-123"));

        console.log("Done await handler in s3EventListener");
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate.mock.calls[0][0].id).toBe("id-123");
        expect(mockUpdate.mock.calls[0][0].attrs.status).toBe("UPLOADED");
    });
});