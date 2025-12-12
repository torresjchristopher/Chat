export enum Gender {
  Male = 'Male',
  Female = 'Female',
  NonBinary = 'Non-Binary',
  Any = 'Any'
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  distance: number; // in miles
  imageUrl: string;
  bio: string;
  isEstablished: boolean; // True = Top Box (Contact), False = Bottom Box (Discoverable)
}

export interface FilterState {
  gender: Gender;
  ageRange: [number, number];
  maxDistance: number;
}

export type Orientation = 'portrait' | 'landscape';
