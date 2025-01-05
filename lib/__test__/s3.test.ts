import { S3 } from "../s3";


describe.skip("Test for S3", () => {

    test("Should return signed url properly", async () => {
        const s3 = new S3({
            bucketName: "vidshare-upload-bucket-naveen",
            region: "ap-south-1",
        });

        const url = await s3.getUploadUrl({
            key: "test.png",
            expiresIn: 60
        });

        console.log("Received signed url as ")
        console.log(url);

        expect(url.includes("vidshare-upload-bucket-naveen")).toBe(true);
        expect(url.includes("test.png")).toBe(true);
    });
});