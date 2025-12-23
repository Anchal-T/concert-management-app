import { mysqlTable, serial, varchar, text, datetime, int, decimal, timestamp, bigint } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Artists Table
export const artists = mysqlTable('artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  genre: varchar('genre', { length: 100 }),
  bio: text('bio'),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Venues Table
export const venues = mysqlTable('venues', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  capacity: int('capacity').notNull(),
  address: varchar('address', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Events Table (Updated)
export const events = mysqlTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }), // Made optional as it might be derived or passed
  description: text('description'),
  date: datetime('date').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('Upcoming'),
  
  /**
   * Foreign Keys
   * Changed from int to bigint unsigned to match the serial type of the referenced tables
   */
  artistId: bigint('artist_id', { mode: 'number', unsigned: true })
    .references(() => artists.id)
    .notNull(),
  venueId: bigint('venue_id', { mode: 'number', unsigned: true })
    .references(() => venues.id)
    .notNull(),

  totalTickets: int('total_tickets'), 
  availableTickets: int('available_tickets'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relations
export const eventsRelations = relations(events, ({ one }) => ({
  artist: one(artists, {
    fields: [events.artistId],
    references: [artists.id],
  }),
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
}));