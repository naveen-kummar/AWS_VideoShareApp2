"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const putHandler_1 = require("../putHandler");
const db_1 = require("../../lib/db");
const s3_1 = require("../../lib/s3");
describe("Test for the Video Put Handler", () => {
    beforeEach(() => {
        jest.spyOn(db_1.DB.prototype, "save").mockImplementation((() => { }));
        jest.spyOn(s3_1.S3.prototype, "getUploadUrl").mockImplementation((() => "url"));
    });
    afterEach(() => {
        //restore the spy created with SpyOn
        jest.resetAllMocks();
    });
    test.only('Should return a 400 statuscode if empty object is passed', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield putHandler_1.handler({ body: JSON.stringify({}) });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
    }));
    test('Should call db Save function if proper body is passed', () => __awaiter(void 0, void 0, void 0, function* () {
        const spySave = jest.spyOn(db_1.DB.prototype, "save");
        spySave.mockImplementation((() => __awaiter(void 0, void 0, void 0, function* () { })));
        const res = yield putHandler_1.handler({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });
        expect(spySave).toBeCalled();
    }));
    test('Should call the save method', () => __awaiter(void 0, void 0, void 0, function* () {
        const spySave = jest.spyOn(db_1.DB.prototype, "save");
        spySave.mockImplementation((() => __awaiter(void 0, void 0, void 0, function* () { })));
        const res = yield putHandler_1.handler({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });
        expect(spySave).toBeCalled();
    }));
    test('should call the function to generate pre-signed url and send that in the body', () => __awaiter(void 0, void 0, void 0, function* () {
        const spyGetUploadUrl = jest.spyOn(s3_1.S3.prototype, 'getUploadUrl');
        spyGetUploadUrl.mockImplementation(() => "http://upload-url");
        const res = yield putHandler_1.handler({
            body: JSON.stringify({
                userId: "user-123",
                title: "Cat-video",
            }),
        });
        expect(spyGetUploadUrl).toBeCalledTimes(1);
        expect(JSON.parse(res.body).uploadUrl).toBe("http://upload-url");
    }));
});
