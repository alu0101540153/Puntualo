#!/usr/bin/env node
// Simple seed script to add example items to the `items` collection for testing recommendations.
// Usage: node server/scripts/seed_items.js

require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')

// Define a minimal Item model here so the seed script can run without TS build step
const { Schema } = mongoose
const itemSchema = new Schema({
  itemType: { type: String, required: true },
  title: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  externalId: { type: String, default: '' }
})
const ItemModel = mongoose.models && mongoose.models.Item ? mongoose.models.Item : mongoose.model('Item', itemSchema)

const MONGO = process.env.MONGO_URI
if (!MONGO) {
  console.error('MONGO_URI not configured in .env')
  process.exit(1)
}

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected to Mongo')

  const examples = [
    {
      itemType: 'movie',
      title: 'La La Land',
      data: { description: 'Un músico y una actriz persiguen sus sueños en Los Ángeles mientras se enamoran.', genres: ['romantica', 'musical'] },
      externalId: ''
    },
    {
      itemType: 'movie',
      title: 'Before Sunrise',
      data: { description: 'Dos jóvenes se conocen en un tren y pasan una noche conversando en Viena.', genres: ['romantica', 'drama'] },
      externalId: ''
    },
    {
      itemType: 'movie',
      title: 'The Notebook',
      data: { description: 'Historia de amor que sigue a una pareja a través de los años.', genres: ['romantica'] },
      externalId: ''
    },
    {
      itemType: 'movie',
      title: 'Mad Max: Fury Road',
      data: { description: 'Adrenalina post-apocalíptica.', genres: ['accion', 'aventura'] },
      externalId: ''
    },
    {
      itemType: 'series',
      title: 'Stranger Things',
      data: { description: 'Misterio ochentero con toques de ciencia ficción.', genres: ['misterio', 'cienciaficcion'] },
      externalId: ''
    },
    {
      itemType: 'series',
      title: '24',
      data: { description: 'Serie de acción y antiterrorismo con un formato en tiempo real.', genres: ['accion', 'thriller'] },
      externalId: ''
    },
    {
      itemType: 'series',
      title: 'The Punisher',
      data: { description: 'Venganzas y acción en este spin-off de Marvel.', genres: ['accion', 'drama'] },
      externalId: ''
    },
    {
      itemType: 'series',
      title: 'Daredevil',
      data: { description: 'Superhéroe en la noche, acción y artes marciales.', genres: ['accion', 'superheroes'] },
      externalId: ''
    },
    {
      itemType: 'book',
      title: 'Pride and Prejudice',
      data: { description: 'Clásico romántico de Jane Austen.', genres: ['romantica', 'clasico'] },
      externalId: ''
    }
  ]

  for (const ex of examples) {
    const exists = await ItemModel.findOne({ title: ex.title }).lean()
    if (exists) {
      console.log('Exists:', ex.title)
      continue
    }
    await ItemModel.create(ex)
    console.log('Inserted:', ex.title)
  }

  console.log('Done')
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
