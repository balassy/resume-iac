import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ResumeFrontendConfigurator } from './frontend/resume-frontend-configurator';
import { ResumeFrontend } from './frontend/resume-frontend';
import { IResumeFrontendParams } from './frontend/resume-frontend.types';

export class ResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const frontendConfigurator = new ResumeFrontendConfigurator(this, 'ResumeFrontendConfig');
    const frontendParams: IResumeFrontendParams = frontendConfigurator.getParams();
    
    new ResumeFrontend(this, 'ResumeFrontend', frontendParams);
  }
}
