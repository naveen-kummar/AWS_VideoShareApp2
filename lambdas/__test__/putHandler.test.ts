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

import { handler } from "../putHandler";
import {DB} from "../../lib/db";
import { S3 } from "../../lib/s3";

describe.skip("Test for the Video Put Handler", () => {

    beforeEach(() =>{
        jest.spyOn(DB.prototype, "save").mockImplementation((() => {}) as any)
        jest.spyOn(S3.prototype, "getUploadUrl").mockImplementation((() => "url") as any)
    })

    afterEach(() => {
        //restore the spy created with SpyOn
        jest.resetAllMocks();
    });
    test.only('Should return a 400 statuscode if empty object is passed', async () => {
        const res = await (handler as any)({body : JSON.stringify({}) });
        console.log(res);
        expect(res.statusCode).toBe(400);
    });

    test('Should call db Save function if proper body is passed', async () => {
        const spySave = jest.spyOn(DB.prototype, "save");

        spySave.mockImplementation( (async () => {}) as any );

        const res = await (handler as any)({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });

        expect(spySave).toBeCalled();

    });

    test('Should call the save method', async () => {
        const spySave = jest.spyOn(DB.prototype, "save");

        spySave.mockImplementation((async () => {}) as any);

        const res = await (handler as any)({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });

        expect(spySave).toBeCalled();

    });

    test('should call the function to generate pre-signed url and send that in the body', async () => {
        const spyGetUploadUrl = jest.spyOn(S3.prototype, 'getUploadUrl')
        spyGetUploadUrl.mockImplementation(async () => "http://upload-url")

        const res = await (handler as any)({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });

        expect(spyGetUploadUrl).toBeCalledTimes(1)

        expect(JSON.parse(res.body).uploadUrl).toBe("http://upload-url")

    });
});