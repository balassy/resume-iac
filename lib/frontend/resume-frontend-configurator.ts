import * as cdk from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from "constructs";

export interface ResumeFrontendParams {
  domainName: string;
}

export class ResumeFrontendConfigurator extends Construct {
  constructor(scope: Construct, id: string ) {
    super(scope, id);
  }

  public getParams(): ResumeFrontendParams {
    return {
      domainName: StringParameter.valueForStringParameter(this, 'ResumeFrontendDomainName')
    };
  }
}