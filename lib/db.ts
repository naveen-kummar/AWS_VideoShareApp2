import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export class DB{

    private client: DynamoDBDocumentClient;

    constructor(
        private config: {
        tableName: string;
        region: string;
    }
) {
        this.client = DynamoDBDocumentClient.from(new DynamoDBClient({
            region : this.config.region,
        }), {
            marshallOptions : {
                removeUndefinedValues : true,
            },
        }
    );
    }
    async save(doc : any) {

         return this.client.send(new PutCommand({
            TableName : this.config.tableName,
            Item : doc,
         }))
    }
}