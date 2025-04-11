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
const spyGetUploadUrl = jest.spyOn(S3.prototype, 'getUploadUrl')

function runBeforeEach(){
    jest.resetAllMocks()
    spySave.mockImplementation((() => {}) as any)
    spyGetUploadUrl.mockImplementation((() => "url") as any)    
}

function callHandler({httpMethod, body} : {
httpMethod : "GET" | "POST" | "PUT" | "DELETE",
body: any
}){
    return (handler as any)({
        body: JSON.stringify(body),
        httpMethod
    });
}



//1. PUT Method
describe("Test for the Video PUT method", () => {

    beforeEach(runBeforeEach)

    test('Should return a 400 statuscode if empty object is passed', async () => {
        const res = await callHandler({
            httpMethod: "PUT",
            body: {}
        })
        console.log(res);
        expect(res.statusCode).toBe(400);
    });

    test('Should call db Save function if proper body is passed', async () => {

        await callHandler({
            httpMethod: "PUT",
            body : {
                userId: "user-123",
                title: "Cat-video",
            }
        })

        expect(spySave).toBeCalled();

    });

    test('Should call the save method', async () => {

     await callHandler({
        httpMethod: "PUT",
        body : {
            userId: "user-123",
            title: "Cat-video",
        }
    })
        expect(spySave).toBeCalled();

    });

    test('should call the function to generate pre-signed url and send that in the body', async () => {

        spyGetUploadUrl.mockImplementation(async () => "http://upload-url")

        const res = await callHandler({
            httpMethod: "PUT",
            body : {
                userId: "user-123",
                title: "Cat-video",
            }
        })

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
describe('Test for GET Method', () => {

})