/**
 * TODO for PutHandler
 * 
 * Should validate the body properly
 * Body should contain
 *      userId <string>
 *      title <string>
 *      description? <string>
 *      tags? <string[]>
 */

import { handler } from "../putHandler";

describe("Test for the Video Put Handler", () => {

    test('Should return a 400 statuscode if emp', async () => {
        const res = await (handler as any)({body : JSON.stringify({})});

        expect(res.statusCode).toBe(400);
    })
});