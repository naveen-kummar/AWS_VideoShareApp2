
/*
TODO:

- Update Video status to be UPLOADED
- Processing the Video file

*/
import {DB} from "../../lib/db";
import { VideoDB } from '../../entity/video'
import { handler } from '../s3EventListener';

describe ("Tests for S3EventListener", () => {
    test("It should call the update method withthe correct metadata", async () => {
        //Let's create a spy
        const mockUpdate = jest.spyOn(VideoDB.prototype, "update");
        
        const res = await (handler as any)();

        console.log("Done await handler in s3EventListener");
        expect(mockUpdate).toBeCalledTimes(1);

    });
});