const { Client } = require('cassandra-driver');

const cassandraConfig = {
  contactPoints: ['localhost'], // Replace with your Cassandra contact points
  localDataCenter: 'datacenter1'
};

const createTables = async () => {
  try {
    await client.connect();
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS discord
      WITH REPLICATION = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 1
      };
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS discord.messages (
        channel_id bigint,
        bucket int,
        message_id bigint,
        author_id bigint,
        content text,
        hashtag list<text>,
        links list<text>,
        users list<text>,
        PRIMARY KEY ((channel_id, bucket), message_id)
      ) WITH CLUSTERING ORDER BY (message_id DESC);
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await client.shutdown();
  }
};

createTables();
