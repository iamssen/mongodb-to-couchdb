import { ObjectID } from 'mongodb';

export type MongoWeight = {
  _id: ObjectID;
  date: Date;
  weight: number;
  bodyfat: number;
  waist: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CouchBody = {
  date: number; // +Date
  weight: number;
  bodyfat: number;
  waist: number;
};
