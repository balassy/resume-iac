import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ResumeFrontendConfigurator } from '../frontend/resume-frontend-configurator';


export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    
    const frontendConfigurator = new ResumeFrontendConfigurator(this, 'ResumeFrontendConfig');
    frontendConfigurator.createParamsWithDefaults();
  }
}