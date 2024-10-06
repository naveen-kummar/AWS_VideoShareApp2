import {DB} from "../db"

describe('Test for DB', () => {

    test('Should save the data in database properly', async () => {
        const db = new DB({
            region : 'ap-south-1',
            tableName : "vidshare-video"
        })

        const res = await db.save({
            id: "test-123",
            userId: "user-12",
        });

        console.log(res);
    })
})