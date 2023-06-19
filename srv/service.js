
module.exports = async (srv) => {
    const { ClaimApproverSet, ClaimSet } = srv.entities


    srv.on(['READ'], ClaimApproverSet, (req) => {
        var email = req.req.authInfo ? req.req.authInfo.getEmail() : undefined;

        if ( email !== undefined) {
            req.query = req.query.from(ClaimSet).where({ NextApprover: email});

            return cds.run(req.query);
        } else {
            return [];
        }


    })
}