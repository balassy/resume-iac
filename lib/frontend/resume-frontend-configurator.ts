import * as cdk from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from "constructs";

const FieldNames = {
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
      domainName: StringParameter.valueForStringParameter(this, FieldNames.DOMAIN_NAME),
      domainAlias: StringParameter.valueForStringParameter(this, FieldNames.DOMAIN_ALIAS),
      certificateArn: StringParameter.valueForStringParameter(this, FieldNames.CERTIFICATE_ARN),
      hostedZoneName: StringParameter.valueForStringParameter(this, FieldNames.HOSTEDZONE_NAME),
      hostedZoneId: StringParameter.valueForStringParameter(this, FieldNames.HOSTEDZONE_ID)
    };
  }
}