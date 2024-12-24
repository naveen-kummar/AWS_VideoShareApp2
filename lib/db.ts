import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export class DB<T extends { id: string }>{

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
    async save(doc : T) {

        console.log("NaveenAwsLog - Inside dbts - save func");
         return this.client.send(new PutCommand({
            TableName : this.config.tableName,
            Item : doc,
         }))
    }

    async update({id, attrs} : {id : string, attrs : Partial<Omit<T, 'id'>>}){
        console.log("Inside VideoDB update");
    }
}