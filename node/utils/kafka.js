import { Kafka } from 'kafkajs';
import { writeToDbTable } from './database.js'

let kafkaHost = 'localhost:9092'
if (process.env.KAFKA_HOST){
    kafkaHost = process.env.KAFKA_HOST
}

// Initialize Kafka connection
const kafka = new Kafka({
    clientId: 'stocks_app',
    brokers: [kafkaHost]
});

const admin = kafka.admin();
const producer = kafka.producer();

const maxRetries = 5; // maximum number of retries
const retryInterval = 3000; // wait interval in milliseconds

async function connectWithRetry(client, retryCount = 0) {
  try {
    await client.connect();
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`Connection failed, retrying... (${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      return connectWithRetry(client, retryCount + 1);
    } else {
      throw error;
    }
  }
}

export async function ensureTopicExists(topicName) {
    await connectWithRetry(admin);
    const existingTopics = await admin.listTopics();

    console.log(existingTopics);

    if (!existingTopics.includes(topicName)) {
        await admin.createTopics({
            topics: [{ topic: topicName }],
        });
        console.log(`Topic ${topicName} created`);
    }

    await admin.disconnect();
}

export async function writeToTopic(array, topic) {
    console.log(`'Events' count: ${array.length}`);

    await connectWithRetry(producer);

    for (let item of array) {
        let r = Math.floor(Math.random() * 1000);
        item = JSON.stringify(item)

        console.log('Sending event:', item);

        await producer.send({
            topic,
            messages: [{ value: item }],
        });

        await new Promise(resolve => setTimeout(resolve, r));
    }

    await producer.disconnect();
}

export async function writeToPostgres(topic, consumerGroup, table) {
    console.log(`Reading 'Events' from ${topic}`);
    const consumer = kafka.consumer({ groupId: consumerGroup });

    await connectWithRetry(consumer);
    await consumer.subscribe({ topic: topic });
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            await writeToDbTable(data, table);
        },
    });
}
