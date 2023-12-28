import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendConfigurator } from '../frontend/frontend-configurator';

export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    
    const gitHubUserName = (new cdk.CfnParameter(this, 'gitHubUserName')).valueAsString;
    const gitHubRepoName = (new cdk.CfnParameter(this, 'gitHubRepoName')).valueAsString;

    const frontendConfigurator = new FrontendConfigurator(this, 'FrontendConfig');
    frontendConfigurator.createParamsWithDefaults();
    frontendConfigurator.createDeployPermissions(gitHubUserName, gitHubRepoName);

    new cdk.CfnOutput(this, 'OutputAwsRegion', {
      value: this.region
    }).overrideLogicalId('AwsRegion');
  }
}
