import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";



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
        const UpdateExpressionArr: string[] = []; //set #title = :title, #description = :description
        const ExpressionAttributeNames: Record<string, any> = {};
        const ExpressionAttributeValues: Record<string, any> = {};

        (Object.keys(attrs) as Array<keyof typeof attrs>).forEach((key) => {
            ExpressionAttributeNames['#${String(key)}'] = key;
            /*Below line will emit compile warning if you do not use 
            "as Array<keyof typeof attrs>" in above line after "Object.keys(attrs)"
            as key will be of type 'any' instead of string*/
            ExpressionAttributeValues[':${String(key)}'] = attrs[key]; 
            UpdateExpressionArr.push('#${String(key)} = :${String(key)}');
        });

 

        return new UpdateCommand({
            TableName : this.config.tableName,
            Key : {
                id: id, //Input Param
            },
            UpdateExpression: 'set $(UpdateExpressionArr.join("," )',
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {},
        })
    }
}