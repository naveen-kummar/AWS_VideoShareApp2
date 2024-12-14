import * as cdk from 'aws-cdk-lib';
import * as lambdaFn from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs';
import {resolve} from 'path'


export class VidShareAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Put Handler
    //new lambdaFn.NodejsFunction(this, "PutHandler", {
   //   entry: resolve(__dirname, "../../lambdas/putHandler.ts")
    //});

  
  }
}
