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

describe("Test for the Video Put Handler", () => {

    afterEach(() => {
        //restore the spy created with SpyOn
        jest.resetAllMocks();
    });
    test('Should return a 400 statuscode if emp', async () => {
        const res = await (handler as any)({body : JSON.stringify({})});

        expect(res.statusCode).toBe(400);
    });

    test('Should call db Save function if proper body is passed', async () => {
        const spySave = jest.spyOn(DB.prototype, "save");

        spySave.mockImplementation(async () => {});

        const res = await (handler as any)({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });

        expect(spySave).toBeCalled();

    });
});