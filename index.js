const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { Client } = require('cassandra-driver');
const { Client: ElasticsearchClient } = require('@elastic/elasticsearch');

// Cassandra configuration
const cassandraConfig = {
  contactPoints: ['localhost'], // Replace with your Cassandra contact points
  localDataCenter: 'datacenter1', // Replace with your Cassandra data center
  keyspace: 'discord_app' // Replace with your Cassandra keyspace
};

const cassandraClient = new Client(cassandraConfig);

// Elasticsearch configuration
const elasticsearchConfig = {
  node: 'http://localhost:9200', // Replace with your Elasticsearch node
  index: 'messages' // Replace with your Elasticsearch index name
};

const elasticsearchClient = new ElasticsearchClient(elasticsearchConfig);


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/message', async (req, res) => {
    const { author, content } = req.body;
  
    // Save the message to Cassandra
    const query = 'INSERT INTO messages (author, content) VALUES (?, ?)';
    await cassandraClient.execute(query, [author, content], { prepare: true });
  
    // Create an index in Elasticsearch
    const indexBody = {
      author,
      content
    };
    await elasticsearchClient.index({
      index: elasticsearchConfig.index,
      body: indexBody
    });
  
    res.sendStatus(200);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});