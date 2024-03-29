import { main as producer } from './producer.js'
import { main as consumer } from './consumer.js'
import { ensureTopicExists } from './utils/kafka.js'

const mode = process.env.MODE

ensureTopicExists('stocks_topic')

// Start producer
if (mode == 'producer') {
  console.log('\n\n***** Starting Kafka PRODUCER *****\n');
  producer()
}
else if (mode == 'consumer') {
  console.log('\n\n***** Starting Kafka CONSUMER *****\n');
  consumer()
}
else {
  console.log('MODE (Environemnt variable) is not set.');
}
