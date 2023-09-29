
module.exports = async (srv) => {
    //const { ClaimApproverSet, ClaimSet,  } = srv.entities


    srv.on(['READ'], 'ActionsSet', (req) => {
        if (req.query.SELECT.search ) {
          req.query.SELECT.search = undefined;
        }
        //Every other cases  
        return cds.run(req.query);  
    });
    srv.on(['READ'], 'AttachmentSet', (req) => {
      /*if (req.query.SELECT.search ) {
        req.query.SELECT.search = undefined;
      }*/
      //Every other cases
      if (req.query.SELECT.where  === undefined ) {
        return [];
      } 
      return cds.run(req.query);  
  });
}