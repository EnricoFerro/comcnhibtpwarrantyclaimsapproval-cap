module.exports = {
    getInitialDataSet: function () {

        const data = require("./WarrantySet.json");
        console.log('Get data ' + JSON.stringify(data));
        return data;
    },
    getEntityInterface: function(entityName) {
        const data = require("./WarrantySet.json");
        console.log('Get data ' + JSON.stringify(data));
        return data;
    },
    executeAction: function (actionDefinition, actionData, keys) {
        console.log('Get Actions ' + JSON.stringify(actionDefinition));
        console.log('Updating the data for ' + JSON.stringify(keys));
    }
};