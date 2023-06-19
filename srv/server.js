const cov2ap = require("@sap/cds-odata-v2-adapter-proxy");
const cds = require("@sap/cds");

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
    app.use(cov2ap(options))
});

module.exports = cds.server;