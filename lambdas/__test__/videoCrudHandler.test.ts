/**
 * TODO for PutHandler
 * 
 * Should validate the body properly
 * Body should contain
 *      userId <string>
 *      title <string>
 *      description? <string>
 *      tags? <string[]>
 * If a valid body is passed, save the data in the database 
 * Create pre-signed url
 * Send that url to the client
 */

import { handler } from "../videoCrudHandler";
import {DB} from "../../lib/db";
import { S3 } from "../../lib/s3";

const spySave = jest.spyOn(DB.prototype, "save");
const spyGet = jest.spyOn(DB.prototype, "get");
const spyGetUploadUrl = jest.spyOn(S3.prototype, 'getUploadUrl')

function runBeforeEach(){
    console.log("videoCrudHandlerTEST - runBeforeEach - 1");
    jest.resetAllMocks()
    console.log("videoCrudHandlerTEST - runBeforeEach - 2");
    spySave.mockImplementation((() => {}) as any)
    console.log("videoCrudHandlerTEST - runBeforeEach - 3a");
    spyGet.mockImplementation((() => {}) as any)
    console.log("videoCrudHandlerTEST - runBeforeEach - 3b");    
    spyGetUploadUrl.mockImplementation((() => "url") as any)
    console.log("videoCrudHandlerTEST - runBeforeEach - 4");    
}

function callHandler({httpMethod, body, queryStringParameters = {}} : {
httpMethod : "GET" | "POST" | "PUT" | "DELETE";
body?: any;
queryStringParameters?: any;
}){
    return (handler as any)({
        body: JSON.stringify(body),
        httpMethod,
        queryStringParameters
    });
}



//1. PUT Method
describe("Test for the Video PUT method", () => {

    beforeEach(runBeforeEach)

    test.skip('Should return a 400 statuscode if empty object is passed', async () => {
        const res = await callHandler({
            httpMethod: "PUT",
            body: {}
        })
        console.log(res);
        expect(res.statusCode).toBe(400);
    });

    test.skip('Should call db Save function if proper body is passed', async () => {

        await callHandler({
            httpMethod: "PUT",
            body : {
                userId: "user-123",
                title: "Cat-video",
            }
        })

        expect(spySave).toBeCalled();

    });

    test.skip('Should call the save method', async () => {

     await callHandler({
        httpMethod: "PUT",
        body : {
            userId: "user-123",
            title: "Cat-video",
        }
    })
        expect(spySave).toBeCalled();

    });

    test.skip('should call the function to generate pre-signed url and send that in the body', async () => {

        console.log("videoCrudHandlerTEST - test4 - 1"); 
        spyGetUploadUrl.mockImplementation(async () => "http://upload-url")

        console.log("videoCrudHandlerTEST - test4 - 2"); 
        const res = await callHandler({
            httpMethod: "PUT",
            body : {
                userId: "user-123",
                title: "Cat-video",
            }
        })

        console.log("videoCrudHandlerTEST - test4 - 3"); 
        expect(spyGetUploadUrl).toBeCalledTimes(1)

        expect(JSON.parse(res.body).uploadUrl).toBe("http://upload-url")

    });
});

/**
 * TODO for GET Handler
 * 
 * /Video?id=video123
 * send the video with that id
 * 
 * /Video?userId=user-1
 * send the list of videos for that user
 * 
 * If no queries passed will return an error
 */

//2. GET Method
describe('Test for Video GET Method', () => {
    beforeEach(runBeforeEach);

    test("should return 400 if no query is passed", async () => {

        const res = await callHandler({
            httpMethod : "GET",
            queryStringParameters : {
                randomValue : "random"
            }
        });

        console.log(res)
        expect(res.statusCode).toBe(400);
    });

    test("Should send a get req to the database with the id", async () => {
        await callHandler({
            httpMethod : "GET",
            queryStringParameters : {
                id : "video-123"
            }
        });

        expect(spyGet).toHaveBeenCalledTimes(1);
        expect(spyGet).toHaveBeenCalledWith("video-123");
        
    });

    test("Should return video doc with that id", async () => {

        spyGet.mockResolvedValue({
            title: "video-title"
        })

        const res = await callHandler({
            httpMethod : "GET",
            queryStringParameters : {
                id : "video-123",
            },
        });

        expect(JSON.parse(res.body).title).toBe("video-title");
        
    });

    test("Should return 404 error if video is not found", async () => {

        spyGet.mockResolvedValue(undefined)

        const res = await callHandler({
            httpMethod : "GET",
            queryStringParameters : {
                id : "video-123",
            },
        });

        console.log(res)

        expect(res.statusCode).toBe(404);
        
    });
});