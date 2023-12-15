import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ResumeFrontendConfigurator } from '../frontend/resume-frontend-configurator';


export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    
    const gitHubUserName = (new cdk.CfnParameter(this, 'gitHubUserName')).valueAsString;
    const gitHubRepoName = (new cdk.CfnParameter(this, 'gitHubRepoName')).valueAsString;

    const frontendConfigurator = new ResumeFrontendConfigurator(this, 'ResumeFrontendConfig');
    frontendConfigurator.createParamsWithDefaults();
    frontendConfigurator.createAccessPermissions(gitHubUserName, gitHubRepoName);
  }
}