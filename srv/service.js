
module.exports = async (srv) => {
    const { ClaimApproverSet, ClaimSet, ClaimReportSet } = srv.entities


    srv.on(['READ'], ClaimApproverSet, (req) => {
        var email = req.req.authInfo ? req.req.authInfo.getEmail() : undefined;

        if ( email !== undefined) {
            req.query = req.query.from(ClaimSet).where({ NextApprover: email});

            return cds.run(req.query);
        } else {
            return [];
        }
    });

    dateRanges = [];
    whereParser = (where) => {
        for (let index = 0; index < where.length; index++) {
            const element = where[index];
            if ( element.ref ) {
                if ( element.ref[0] === 'createDate' ) {
                    dateRanges.push( {
                        key: where[index].ref[0],
                        operator: where[index+1],
                        date:  where[index+2].val ? new Date(where[index+2].val) : null,
                    });
                    where.splice(index+2, 1);
                    where.splice(index+1, 1);
                    where.splice(index, 1);
                    if ( where[index-1] === 'and') {
                        where.splice(index-1, 1);
                    }
                    index--;
                    if (index === -1 && where[0] === 'and' ) {
                        where.splice(0, 1);
                    }
                }
            }
            if (element.xpr) {
                where[index].xpr = whereParser(element.xpr)
            }
        }
        return where;
    }

    srv.on(['READ'], ClaimReportSet, (req) => {

            req.query = req.query.from(ClaimSet);
            dateRanges = [];
            /*
             * Remove the createDate from the where
             */
            req.query.SELECT.where = req.query.SELECT.where ? whereParser(req.query.SELECT.where) : undefined;
            return cds.run(req.query).then(items => {
                if (req.query.SELECT.one) {
                    /**
                     * Single Line
                     */
                    try {
                        parsed = JSON.parse(items.claimActualData)
                        items.createDate = new Date(parsed.CreateDate); 
                    } catch (error) {
                        items.createDate = null;
                    }
                    return items; 
                } else {
                    /**
                     * Multiple Lines
                     */
                    items.map(item => {
                        try {
                            parsed = JSON.parse(item.claimActualData)
                            item.createDate = new Date(parsed.CreateDate); 
                        } catch (error) {
                            item.createDate = null;
                        }
                        return item; 
                    });

                    /**
                     * Filter for createDate
                     */
                    return items.filter(item => {
                        var check = true;
                        for (const iterator of dateRanges) {
                            switch (iterator.operator) {
                                case '>':   check = check && item.createDate > iterator.date; break;
                                case '<':   check = check && item.createDate < iterator.date; break;
                                case '>=':  check = check && item.createDate >= iterator.date; break;
                                case '<=':  check = check && item.createDate <= iterator.date; break;
                                case '==':  check = check && item.createDate == iterator.date; break;
                                case '!=':  check = check && item.createDate != iterator.date; break;
                                case '===': check = check && item.createDate === iterator.date; break;
                                case '!==': check = check && item.createDate !== iterator.date; break;
                                default:   check = false; break;
                            }
                        }
                        return check;
                    });
                }
            });

    })
}