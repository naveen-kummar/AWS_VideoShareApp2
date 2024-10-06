import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";



export class DB{

    private client: DynamoDBClient;

    constructor(private config: {
        tableName: string,
        region: string
    }) {
        this.client = new DynamoDBClient({
            region : this.config.region
        })
    }
    async save(doc : any) {

         return this.client.send(new PutCommand({
            TableName : this.config.tableName,
            Item : doc,
         }))
    }
}