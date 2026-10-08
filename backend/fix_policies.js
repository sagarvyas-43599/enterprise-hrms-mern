const mongoose = require('mongoose');
const dns = require('node:dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.log('Failed to set DNS', e);
}

mongoose.connect('mongodb+srv://vyassagar43599_db_user:IHqrPsXPU7tdGPHA@cluster0.kim0rdb.mongodb.net/hrms_db').then(async () => {
  await mongoose.connection.collection('policies').updateMany({}, { $set: { isDeleted: false } });
  console.log('Fixed isDeleted');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
