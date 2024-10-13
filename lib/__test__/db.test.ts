import {DB} from "../db"

describe.skip ('Test for DB', () => {

    test('Should save the data in database properly', async () => {
        const db = new DB({
            region : 'ap-south-1',
            tableName : "vidshare-video"
        })

        const res = await db.save({
            id: "test-127",
            userId: "user-17",
            tags: undefined,
        });

        console.log(res);
    })
})