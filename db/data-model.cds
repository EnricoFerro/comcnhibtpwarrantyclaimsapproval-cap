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
        claimActualData : LargeString;
        comments        : Association to many Comments on comments.claimID = $self;
}


@cds.persistence.skip: true
entity ClaimApprovers {
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
        claimActualData : LargeString;
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

@sap.creatable : 'false'
@sap.updatable : 'false'
@sap.deletable : 'false'
@sap.pageable : 'false'
@cds.persistence.skip: true
entity ClaimReport {
    key id              : UUID;
        claimNo         : String;
        status          : String;
        statusCode      : String;
        nextApprover    : String;
        currentLevel    : Integer;
        requestor       : String;
        createDate      : DateTime;
        sequence        : array of {
                            name: String;
                            email: String;
                            level: Integer;
                            statusCode: String;
                            };
        claimActualData : LargeString;
}