import { ObjectID } from 'mongodb';

export type RescuetimeActivity = {
  activity: string;
  time: number;
};

export type MongoRescueTime = {
  _id: ObjectID;
  allDistracting: number;
  allProductive: number;
  business: number;
  communicationAndScheduling: number;
  date: Date;
  designAndComposition: number;
  distracting: number;
  entertainment: number;
  neutral: number;
  news: number;
  productive: number;
  referenceAndLearning: number;
  shopping: number;
  socialNetworking: number;
  softwareDevelopment: number;
  total: number;
  utilities: number;
  veryDistracting: number;
  veryProductive: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CouchRescueTime = {
  allDistracting: number;
  allProductive: number;
  business: number;
  communicationAndScheduling: number;
  date: number; // +Date
  designAndComposition: number;
  distracting: number;
  entertainment: number;
  neutral: number;
  news: number;
  productive: number;
  referenceAndLearning: number;
  shopping: number;
  socialNetworking: number;
  softwareDevelopment: number;
  total: number;
  utilities: number;
  veryDistracting: number;
  veryProductive: number;
  activities?: RescuetimeActivity[];
};
