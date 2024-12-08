import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs';


export class VidShareAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new lambda.Function(this, "my-lambda", {
      code: lambda.Code.fromInline(
        "exports.handler = async ()=> {console.log('hello')}"
      ),
      handler : "index.handler",
      runtime : lambda.Runtime.NODEJS_18_X
    });

    new s3.CfnBucket(this, "my-bucket");
  }
}
