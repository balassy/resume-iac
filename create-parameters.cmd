aws ssm put-parameter --name "/Resume/Frontend/DomainName" --value "example.com" --type String --tags "Key=project,Value=resume" --profile staging
aws ssm put-parameter --name "/Resume/Frontend/DomainAlias" --value "www.example.com" --type String --tags "Key=project,Value=resume" --profile staging
aws ssm put-parameter --name "/Resume/Frontend/CertificateArn" --value "arn:aws:acm:us-east-1:..." --type String --tags "Key=project,Value=resume" --profile staging
aws ssm put-parameter --name "/Resume/Frontend/HostedZoneName" --value "example.com" --type String --tags "Key=project,Value=resume" --profile staging
aws ssm put-parameter --name "/Resume/Frontend/HostedZoneId" --value "Z0404316S8A6B49TT7IB" --type String --tags "Key=project,Value=resume" --profile staging