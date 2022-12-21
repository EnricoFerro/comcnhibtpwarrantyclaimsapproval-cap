using {com.cnhi.btp.claimapprovalsrv as schema} from '../db/data-model';

@path: '/api/v2/srv/ZCLAIMAPPROVALSRV'
service ZCLAIMAPPROVALSRV {
  entity ClaimSet as projection on schema.Claim;
  entity CommentSet as projection on schema.Comments;
}