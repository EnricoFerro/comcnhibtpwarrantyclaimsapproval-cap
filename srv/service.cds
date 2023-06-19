using {com.cnhi.btp.claimapprovalsrv as schema} from '../db/data-model';

@path: '/api/v2/srv/ZCLAIMAPPROVALSRV'
service ZCLAIMAPPROVALSRV @(requires:'authenticated-user') {
  entity ClaimSet as projection on schema.Claim;

  entity ClaimApproverSet as projection on schema.ClaimApprovers;

  entity CommentSet as projection on schema.Comments;
}