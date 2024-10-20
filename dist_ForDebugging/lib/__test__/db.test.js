"use strict";
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
const db_1 = require("../db");
describe.skip('Test for DB', () => {
    test('Should save the data in database properly', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new db_1.DB({
            region: 'ap-south-1',
            tableName: "vidshare-video"
        });
        const res = yield db.save({
            id: "test-127",
            userId: "user-17",
            tags: undefined,
        });
        console.log(res);
    }));
});
//# sourceMappingURL=db.test.js.map