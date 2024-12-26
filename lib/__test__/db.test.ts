import {DB} from "../db"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

describe ('Test for DB', () => {

    test.skip('Should save the data in database properly', async () => {
        const db = new DB<any>({
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

    //Test to test the parameters sent to send() of DynamoDBDocumentClient
    test('Should pass proper input to the update method', async () => {

        /* Here we do mockImplementation to avoid actual call to "this.client.send" in
        db.ts-->update as that will update orginal db
         */
        const mockedSend = jest.spyOn(DynamoDBDocumentClient.prototype, 'send')
        .mockImplementation(async () => {}); //Lets pass empty function to mockImplementation

        //Now let's make a dummy update
        const db = new DB<{
        id: string,
        title: string,
        description: string,
        }>({
            region : 'ap-south-1',
            tableName : "vidshare-video"
        })

        await db.update({
            id: "test-123",
            attrs : {
             title: "new-title",
             description: 'new-description'
            }
        });

        /*Lets log to see what parameters (i.e 'new UpdateCommand')sent to the
        this.client.send in db.ts-->update()*/
        //console.log(mockedSend.mock.calls[0][0]); //Let see what is there in 1st call 1st parameter

        //Lets extract value of 'input' key of 1st call 1st parameter i.e. UpdateCommand
        const input = mockedSend.mock.calls[0][0].input as any;//without 'as any' in below line 'input.UpdateExpression' will be yelling with error
        expect(input.UpdateExpression).toBe(
            "set #title = :title, #description = :description");
    });
});