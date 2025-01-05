
/*
TODO:

- Update Video status to be UPLOADED
- Get the video metadata
- Based on metadata convert the video into multiple resolution
   // width >= 1280 --> 1280x720 & 640x360
   // 1280 < width <= 640 --> 640x360
   // 640 < width --> width
*/
//import {DB} from "../../lib/db";
import { VideoDB } from '../../entity/video'
import { VideoMetadata } from '../../lib/video-metadata'
import { handler } from '../s3EventListener';
import { VideoConverter } from '../../lib/video-converter'

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

function callHandler() {
   return (handler as any)(getEvent("test-bucket", "id-123"));
}

describe ("Tests for S3EventListener", () => {

   const mockUpdate = jest.spyOn(VideoDB.prototype, "update");
   const mockedGetMetadata = jest.spyOn(VideoMetadata.prototype, "frommUrl")
   const mockedAddResolution = jest.spyOn(VideoConverter.prototype, "addResolution4");

   beforeEach(async() => {
      console.log("Inside beforeEach - About to call getEvent");
    mockUpdate.mockImplementation(async () => undefined as any);
    mockedGetMetadata.mockResolvedValue({
      fileSize: 0,
      width: 0,
      height: 0,
   });
   })
   
   afterEach(() => {
      console.log("Inside afterEach - resetAllMocks");
    jest.resetAllMocks()
   })

    //TestCase - 1
    test("It should call the update method withthe correct metadata", async() => {
        //Let's create a spy
        await callHandler();
          console.log("Done await handler in s3EventListener");
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate.mock.calls[0][0].id).toBe("id-123");
        expect(mockUpdate.mock.calls[0][0].attrs.status).toBe("UPLOADED");
    });

    //TestCase -2 
    test("Should get the url properly and send to the getMetdata function", async() => {
      await callHandler();
      expect(mockedGetMetadata).toHaveBeenCalledTimes(1);
      const input = mockedGetMetadata.mock.calls[0][0];
      console.log(input);
      expect(input).toContain("http");
      expect(input).toContain("id-123");
    });

    //Testcase - 3 - "// width >= 1280 --> 1280x720 & 640x360"
    test("Should get 2 video res if width is greater than or equal to 1280", async() => {

      /*Let's test what will be behaviour if we get below mentioned
      meta data values*/
      mockedGetMetadata.mockResolvedValue({
         fileSize: 13154,
         width: 1280,
         height: 720,
      });
      await callHandler();

      /*For width >= 1280 following two resolutions
      should be called 1280x720 & 640x360" */
      expect(mockedAddResolution).toHaveBeenCalledTimes(2);
      //1st Resolution
      expect(mockedAddResolution.mock.calls[0][0].width).toBe(1280);
      expect(mockedAddResolution.mock.calls[0][0].height).toBe(720);
      //2nd Resolution
      expect(mockedAddResolution.mock.calls[1][0].width).toBe(640);
      expect(mockedAddResolution.mock.calls[1][0].height).toBe(360);
    });

    //Testcase - 4 - "// width == 854 --> Then only one res 854x480 should be called
    test("Should get single res if width is greater than or equal to 640 and less than 1280", async() => {

      /*Let's test what will be behaviour if we get below mentioned
      meta data values*/
      mockedGetMetadata.mockResolvedValue({
         fileSize: 1315,
         width: 854,
         height: 480,
      });
      await callHandler();

      /*For width == 854 --> Then only one res 854x480 should be called" */
      expect(mockedAddResolution).toHaveBeenCalledTimes(1);
      //1st Resolution
      expect(mockedAddResolution.mock.calls[0][0].width).toBe(640);
      expect(mockedAddResolution.mock.calls[0][0].height).toBe(360);
    });    

    //Testcase - 5 - "// width < 640 --> Then only one res call with orginal width & Height need to be called
    test("When width is less than 640 Then only one res call with orginal width & Height need to be called", async() => {

      /*Let's test what will be behaviour if we get below mentioned
      meta data values*/
      mockedGetMetadata.mockResolvedValue({
         fileSize: 131,
         width: 426,
         height: 240,
      });
      await callHandler();

      /*For width == 854 --> Then only one res 854x480 should be called" */
      expect(mockedAddResolution).toHaveBeenCalledTimes(1);
      //1st Resolution
      expect(mockedAddResolution.mock.calls[0][0].width).toBe(426);
     expect(mockedAddResolution.mock.calls[0][0].height).toBe(240);
    });     
});