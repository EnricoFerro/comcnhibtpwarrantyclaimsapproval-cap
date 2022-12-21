using { Currency, managed, cuid } from '@sap/cds/common';
namespace com.cnhi.btp.claimapprovalsrv;

entity Claim {
    key id              : UUID;
        claimNo         : String;
        status          : String;
        statusCode      : String;
        nextApprover    : String;
        currentLevel    : Integer;
        requestor       : String;
        sequence        : array of {
                            name: String;
                            email: String;
                            level: Integer;
                            statusCode: String;
                            };
        claimActualData : String;
        comments        : Association to many Comments on comments.claimID = $self;
}

entity Comments: managed {
    key id              : UUID;
        claimID         : Association to Claim;
        claimNo         : String;
        type            : String;
        comment         : String;
        user            : String;
        authorID        : String;
        authorName      : String;
}