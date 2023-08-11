import * as cdk from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from "constructs";

const ParamNames = {
  DOMAIN_NAME: '/Resume/Frontend/DomainName',
  DOMAIN_ALIAS: '/Resume/Frontend/DomainAlias',
  CERTIFICATE_ARN: '/Resume/Frontend/CertificateArn',
  HOSTEDZONE_NAME: '/Resume/Frontend/HostedZoneName',
  HOSTEDZONE_ID: '/Resume/Frontend/HostedZoneId',
};

export interface ResumeFrontendParams {
  domainName: string;
  domainAlias: string;
  certificateArn: string;
  hostedZoneName: string;
  hostedZoneId: string;  
}

export class ResumeFrontendConfigurator extends Construct {
  constructor(scope: Construct, id: string ) {
    super(scope, id);
  }

  public getParams(): ResumeFrontendParams {
    return {
      domainName: StringParameter.valueForStringParameter(this, ParamNames.DOMAIN_NAME),
      domainAlias: StringParameter.valueForStringParameter(this, ParamNames.DOMAIN_ALIAS),
      certificateArn: StringParameter.valueForStringParameter(this, ParamNames.CERTIFICATE_ARN),
      hostedZoneName: StringParameter.valueForStringParameter(this, ParamNames.HOSTEDZONE_NAME),
      hostedZoneId: StringParameter.valueForStringParameter(this, ParamNames.HOSTEDZONE_ID)
    };
  }

  public createParamsWithDefaults() {
    new StringParameter(this, 'ResumeFrontendParamDomainName', { parameterName: ParamNames.DOMAIN_NAME, stringValue: 'example.com' });
    new StringParameter(this, 'ResumeFrontendParamDomainAlias', { parameterName: ParamNames.DOMAIN_ALIAS, stringValue: 'www.example.com' });
    new StringParameter(this, 'ResumeFrontendParamCertificateArn', { parameterName: ParamNames.CERTIFICATE_ARN, stringValue: 'arn:aws:acm:us-east-1:...' });
    new StringParameter(this, 'ResumeFrontendParamHostedZoneName', { parameterName: ParamNames.HOSTEDZONE_NAME, stringValue: 'example.com' });
    new StringParameter(this, 'ResumeFrontendParamHostedZoneId', { parameterName: ParamNames.HOSTEDZONE_ID, stringValue: 'Z04057...' });
  }
}