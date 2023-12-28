import { AccountId, GitHubRepoName, GitHubUserName } from "../types";

export interface IFrontendParams {
  domainName: string;
  domainAlias: string;
  certificateArn: string;
  hostedZoneName: string;
  hostedZoneId: string;  
}

export interface IFrontendProps extends IFrontendParams {
  accountId: AccountId,
  gitHubUserName: GitHubUserName,
  gitHubRepoName: GitHubRepoName
};