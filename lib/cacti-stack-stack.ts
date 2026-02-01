import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CactiStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myFunctionPython = new lambda.Function(this, "HelloWorldFunctionPython", {
      runtime: lambda.Runtime.PYTHON_3_12, // or PYTHON_3_11, PYTHON_3_10
      handler: "index.handler",
      code: lambda.Code.fromInline(`
import json

def handler(event, context):
    return {
        'statusCode': 200,
        'body': json.dumps('Hello World! this has been updated and again')
    }
      `),
        });

    const myFunctionPythonUrl = myFunctionPython.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    
    new cdk.CfnOutput(this, "myFunctionPythonUrlOutput", {
      value: myFunctionPythonUrl.url,
    })
  }
}
