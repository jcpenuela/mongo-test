const {MongoClient} = require('mongodb'); //.MongoClient;


const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json')
const assert = require('assert');
const url = 'mongodb+srv://jcpenuela:KaleMongo-50@cluster0.dkhpi.mongodb.net/sandbox?retryWrites=true&w=majority';
const dbName = 'circulation';


async function main() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    try {
        const results = await circulationRepo.loadData(data);
        assert.strictEqual(results.insertedCount, data.length);
        
        const items = await circulationRepo.get();
        assert.strictEqual(items.length, data.length);   
 
        const filteredItems = await circulationRepo.get({Newspaper: items[4].Newspaper});
        assert.deepStrictEqual(items[4], filteredItems[0]);  

        const limitedItems = await circulationRepo.get({}, 3);
        assert.strictEqual(limitedItems.length, 3);

        const id = items[4]._id.toString();
        const byId = await circulationRepo.getById(id);
        assert.deepStrictEqual(byId, items[4]);


        const newItem = {
            "Newspaper": "My paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        };
        const addedItem = await circulationRepo.add(newItem);
        assert(addedItem._id);
        const addItemQuery = await circulationRepo.getById(addedItem._id.toString());
        assert.deepStrictEqual(addedItem, addItemQuery);

        const updatedItem = await circulationRepo.update(addedItem._id.toString(), {
            "Newspaper": "My new paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        });
        assert.deepStrictEqual(updatedItem.Newspaper, 'My new paper');

        const newAddItemQuery = await circulationRepo.getById(addedItem._id.toString());
        assert.deepStrictEqual(newAddItemQuery.Newspaper, 'My new paper');

        const removed = circulationRepo.remove(newAddItemQuery._id.toString());
        assert(removed);

        const removedItemQuery = await circulationRepo.getById(addedItem._id.toString());
        console.log(removedItemQuery);

    } catch (error) {
        console.log(error);
    } finally {
        const admin = client.db(dbName).admin();
        await client.db(dbName).dropDatabase();
        // console.log(await admin.listDatabases());
        client.close();
    }
     
    
    
}

main();