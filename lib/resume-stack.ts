import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ResumeFrontendConfigurator } from './frontend/resume-frontend-configurator';
import { IResumeFrontendProps, ResumeFrontend } from './frontend/resume-frontend';
import { IResumeFrontendParams } from './frontend/resume-frontend.types';

export class ResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Get parameters from AWS Systems MAnager Parameter Store.
    const frontendConfigurator = new ResumeFrontendConfigurator(this, 'ResumeFrontendConfig');
    const frontendParams: IResumeFrontendParams = frontendConfigurator.getParams();

    // Get stack input (command line) parameters.
    const gitHubUserName = (new cdk.CfnParameter(this, 'gitHubUserName')).valueAsString;
    const gitHubRepoName = (new cdk.CfnParameter(this, 'gitHubRepoName')).valueAsString;

    const frontendProps: IResumeFrontendProps = {
      ...frontendParams,
      accountId: this.account,
      gitHubUserName,
      gitHubRepoName
    };
    
    new ResumeFrontend(this, 'ResumeFrontend', frontendProps);

    new cdk.CfnOutput(this, 'ResumeOutputAwsRegion', {
      value: this.region
    }).overrideLogicalId('AwsRegion');
  }
}
