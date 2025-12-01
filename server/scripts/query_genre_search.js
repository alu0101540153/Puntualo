#!/usr/bin/env node
require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')

const { Schema } = mongoose
const itemSchema = new Schema({ itemType: String, title: String, data: Schema.Types.Mixed })
const Item = mongoose.models && mongoose.models.Item ? mongoose.models.Item : mongoose.model('Item', itemSchema)

async function main(){
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  const genre = 'romance'
  const g = genre.trim().replace(/\s+/g,'')
  const gPrefix = g.slice(0, Math.min(4, g.length))
  const query = { itemType: 'movie', $or: [ { 'data.genres': { $regex: new RegExp(genre, 'i') } }, { 'data.genres': { $regex: new RegExp(gPrefix, 'i') } } ] }
  const items = await Item.find(query).lean()
  console.log('Query:', JSON.stringify(query))
  console.log('Found:', items.map(i=>i.title))
  await mongoose.disconnect()
}
main().catch(e=>{console.error(e); process.exit(1)})
