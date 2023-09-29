const cov2ap = require("@sap/cds-odata-v2-adapter-proxy");
const cds = require("@sap/cds");
const multer  = require('multer')
const bodyParser = require('body-parser');
const upload = multer({ dest: 'uploads/' })

const options = {
    path: "sap/opu/odata/sap"
};
cds.on('bootstrap', async app => {
    app.use((req, res, next) => {
        res.set('access-control-allow-origin', '*');
        next();
    });
});
cds.on("bootstrap", (app) => {
    app.put(/^\/sap\/opu\/odata\/sap\/ZBTP_POC3_GTW_SRV\/AttachmentStreamSet\(Clmno=\'(.*)\',FileName=\'(.*)\'\)\/\$value$/,[bodyParser.raw({type: 'application/octet-stream', limit : '2mb'}), upload.any()], async (req, res, next) => {
        
        if ( req.params[0] && req.params[1] && req.files && req.files[0] && req.files[0].mimetype ) {
            attachmentSet = {
                "Clmno": req.params[0],
                "FileName": req.params[1] ,
                "MimeType": req.files[0].mimetype,
                "CreatedBy": req.body.CreatedBy,
                "CreateDate": new Date().toISOString()
            }
            try {
                await INSERT(attachmentSet).into("com.cnhi.btp.warrantysrvs.AttachmentSet");
                res.sendStatus(204);
            } catch (error) {
                res.sendStatus(400);
            }
        } else if  ( req.params[0] && req.params[1] && req.get('content-type')  && req.get('created-by') ) {
            attachmentSet = {
                "Clmno": req.params[0],
                "FileName": req.params[1] ,
                "MimeType": req.get('content-type'),
                "CreatedBy": req.get('created-by'),
                "CreateDate": new Date().toISOString()
            }
            try {
                await INSERT(attachmentSet).into("com.cnhi.btp.warrantysrvs.AttachmentSet");
                res.sendStatus(204);
            } catch (error) {
                res.sendStatus(400);
            } 
        } else {
            res.sendStatus(400);

        }

    });
    app.post('/sap/opu/odata/sap/ZBTP_POC3_GTW_SRV/AttachmentSet/:id', [bodyParser.raw({type: 'application/octet-stream', limit : '2mb'}), upload.any()], async (req, res, next) => {
        if (req.params.id === '$value' ) {
            if ( req.body.Clmno && req.body.CreatedBy && req.files[0] && req.files[0].originalname && req.files[0].mimetype ) {
                attachmentSet = {
                    "Clmno": req.body.Clmno,
                    "FileName": req.files[0].originalname,
                    "MimeType": req.files[0].mimetype,
                    "CreatedBy": req.body.CreatedBy,
                    "CreateDate": new Date().toISOString()
                }
                try {
                    await INSERT(attachmentSet).into("com.cnhi.btp.warrantysrvs.AttachmentSet");
                    res.sendStatus(200);
                } catch (error) {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(400);

            }
        } else {
            req.next();
        }
    });
    app.get('/sap/opu/odata/sap/ZBTP_POC3_GTW_SRV/AttachmentSet*/:id', (req, res, next) => {
        if (req.params.id === '$value' ) {
            res.sendFile('hello.txt', { root: __dirname, headers: {'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment;filename=hello.txt' }});
        } else {
            req.next();
        }
    });
    app.get('/sap/opu/odata/sap/ZBTP_POC3_GTW_SRV/AttachmentStreamSet*/:id', (req, res, next) => {
        if (req.params.id === '$value' ) {
            res.sendFile('hello.txt', { root: __dirname, headers: {'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment;filename=hello.txt' }});
        } else {
            req.next();
        }
    });
    app.use(cov2ap(options))
});

module.exports = cds.server;