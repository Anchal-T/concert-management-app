import { mysqlTable, serial, varchar, text, datetime, int, decimal, timestamp, bigint, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: int('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Artists Table
export const artists = mysqlTable('artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  genre: varchar('genre', { length: 100 }),
  bio: text('bio'),
  imageUrl: varchar('image_url', { length: 500 }),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('0.0'),
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

// Tags Table
export const tags = mysqlTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }).default('#8b5cf6'),
  createdAt: timestamp('created_at').defaultNow(),
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

  totalTickets: int('total_tickets').default(0),
  soldTickets: int('sold_tickets').default(0),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Event Tags Junction Table (many-to-many)
export const eventTags = mysqlTable('event_tags', {
  eventId: bigint('event_id', { mode: 'number', unsigned: true })
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: bigint('tag_id', { mode: 'number', unsigned: true })
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.tagId] }),
}));

// Ticket Sales Table (for tracking individual sales)
export const ticketSales = mysqlTable('ticket_sales', {
  id: serial('id').primaryKey(),
  eventId: bigint('event_id', { mode: 'number', unsigned: true })
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  quantity: int('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  buyerEmail: varchar('buyer_email', { length: 255 }),
  soldAt: timestamp('sold_at').defaultNow(),
});

// Settings Table (for app configuration)
export const settings = mysqlTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value'),
  description: varchar('description', { length: 255 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  artist: one(artists, {
    fields: [events.artistId],
    references: [artists.id],
  }),
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  eventTags: many(eventTags),
  ticketSales: many(ticketSales),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  eventTags: many(eventTags),
}));

export const eventTagsRelations = relations(eventTags, ({ one }) => ({
  event: one(events, {
    fields: [eventTags.eventId],
    references: [events.id],
  }),
  tag: one(tags, {
    fields: [eventTags.tagId],
    references: [tags.id],
  }),
}));

export const ticketSalesRelations = relations(ticketSales, ({ one }) => ({
  event: one(events, {
    fields: [ticketSales.eventId],
    references: [events.id],
  }),
}));