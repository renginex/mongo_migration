const MongoClient = require('mongodb').MongoClient;
const collections = []
const URLS = {
  src: '<<MONGODB_CONNECTION_STRING>>',
  dst: '<<MONGODB_CONNECTION_STRING>>',
};

async function runMongoScript(script, src, dst, col) {
  try {
    const client_src = await MongoClient.connect(src, { useNewUrlParser: true, });
    const db_src = client_src.db();
    const client_dst = await MongoClient.connect(dst, { useNewUrlParser: true, });
    const db_dst = client_dst.db();
    await script(db_src, db_dst, col);
    client_src.close();
    client_dst.close();
  } catch (err) {
    console.log(err);
  }
}

const ObjectId = require('mongodb').ObjectID;
async function script(src, dst, col) {
  const Data = src.collection(col);
  return await Data
    .find({})
    .forEach(result => {
      try {
        dst.collection(col).insertOne(result);
        src.collection(col).deleteOne({ _id: result._id })
      } catch (err) {
        console.log(err);
      }
    });
}

collections.forEach(col => {
  runMongoScript(script, URLS.src, URLS.dst, col);
});
