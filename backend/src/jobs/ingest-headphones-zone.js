const ingestGenericRetailer = require('./ingest-generic-retailer');

async function ingestHeadphonesZone() {
    const retailerName = 'Headphones Zone';
    const listRobotId = process.env.BROWSEAI_HEADPHONESZONE_LIST_ROBOT_ID;
    const detailRobotId = process.env.BROWSEAI_HEADPHONESZONE_DETAIL_ROBOT_ID;
    
    if (!listRobotId || !detailRobotId) {
        throw new Error('Headphones Zone Robot IDs missing in .env');
    }

    return await ingestGenericRetailer(retailerName, listRobotId, detailRobotId);
}

if (require.main === module) {
    const db = require('../database/db');
    ingestHeadphonesZone().finally(() => db.pool.end());
}

module.exports = ingestHeadphonesZone;
