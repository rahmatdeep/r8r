import { Kafka } from "kafkajs";

export const TOPIC_NAME = "zap-events";

export const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});
