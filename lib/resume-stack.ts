import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendConfigurator } from './frontend/frontend-configurator';
import { Frontend } from './frontend/frontend';
import { IFrontendParams, IFrontendProps } from './frontend/types';

export class ResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Get parameters from AWS Systems Manager Parameter Store.
    const frontendConfigurator = new FrontendConfigurator(this, 'FrontendConfig');
    const frontendParams: IFrontendParams = frontendConfigurator.getParams();

    // Get stack input (command line) parameters.
    const gitHubUserName = (new cdk.CfnParameter(this, 'gitHubUserName')).valueAsString;
    const gitHubRepoName = (new cdk.CfnParameter(this, 'gitHubRepoName')).valueAsString;

    const frontendProps: IFrontendProps = {
      ...frontendParams,
      accountId: this.account,
      gitHubUserName,
      gitHubRepoName
    };
    
    new Frontend(this, 'Frontend', frontendProps);

    new cdk.CfnOutput(this, 'OutputAwsRegion', {
      value: this.region
    }).overrideLogicalId('AwsRegion');
  }
}
