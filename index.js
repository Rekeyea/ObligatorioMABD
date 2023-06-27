const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Snowflake } = require('nodejs-snowflake');

const uid = new Snowflake({instance_id: 10, custom_epoch: (2023-1970)*31536000*1000});

const { Client } = require('cassandra-driver');

// Cassandra configuration
const cassandraConfig = {
  contactPoints: ['localhost'], // Replace with your Cassandra contact points
  localDataCenter: 'datacenter1', // Replace with your Cassandra data center
  keyspace: 'discord' // Replace with your Cassandra keyspace
};

const cassandraClient = new Client(cassandraConfig);
cassandraClient.connect();


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
// Serve static files
app.use(express.static('public'));

// Routes
app.get('/channel/:channel_id/user/:user_id', async (req, res) => {
  const channel_id = req.params.channel_id;
  const user_id = req.params.user_id;
  
  const query = 'SELECT * FROM discord.messages WHERE channel_id = ? AND bucket = ? ORDER BY message_id ASC LIMIT ?';
  const params = [channel_id, 1, 10];
  const result = await cassandraClient.execute(query, params, { prepare: true });
  const messages = result.rows;
  res.render('template', { channel_id, user_id, messages });
});

async function saveMessage(message) {
  const query = 'INSERT INTO discord.messages (channel_id, bucket, message_id, author_id, content, hashtag, links, users) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  const params = [
    message.channelId,
    message.bucket,
    message.messageId,
    message.authorId,
    message.content,
    message.hashtags,
    message.links,
    message.users
  ];

  try {
    await cassandraClient.execute(query, params, { prepare: true });
    console.log('Message saved successfully!');
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

app.post('/message', async (req, res) => {
  const { channelId, authorId, content, hashtags, links, users } = req.body;
  
  const messageId = uid.getUniqueID().toString();
  
  // Create a sample message object
  const message = {
    channelId: channelId,
    bucket: 1,
    messageId,
    authorId: authorId,
    content: content,
    hashtags: hashtags,
    links: links,
    users: users
  };

  // Save the message
  saveMessage(message);

  res.sendStatus(200);
});

app.get('/messages/:channel_id', async (req, res) => {
  const channel_id = parseInt(req.params.channel_id);

  const query = 'SELECT * FROM discord.messages WHERE channel_id = ? AND bucket = ? ORDER BY message_id DESC LIMIT ?';

  const params = [channel_id, 1, 10];

  try {
    const result = await cassandraClient.execute(query, params, { prepare: true });

    const messages = result.rows;
    return res.json({ messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving the messages' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});