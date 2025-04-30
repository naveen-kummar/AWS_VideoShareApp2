import { VideoDB } from "../video";

describe("Test for video entity", () => {
    test("Test query by userId", async () => {
        const videoTable = new VideoDB({
            region: "ap-south-1",
            tableName: "VidShareAppStack-VideoTableE38FEE4B-1AGSE8SKKJO44",
        });
        const res = await videoTable.getByUserId("user-1");
        console.log("Result of query by userId", res);

    });

});     