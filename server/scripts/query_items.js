#!/usr/bin/env node
require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')

const { Schema } = mongoose
const itemSchema = new Schema({ itemType: String, title: String, data: Schema.Types.Mixed })
const Item = mongoose.models && mongoose.models.Item ? mongoose.models.Item : mongoose.model('Item', itemSchema)

async function main(){
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected')
  const q1 = await Item.find({ 'data.genres': { $regex: /romantica/i } }).lean()
  console.log('match romantica:', q1.map(i=>i.title))
  const q2 = await Item.find({ 'data.genres': { $regex: /roma/i } }).lean()
  console.log('match roma:', q2.map(i=>i.title))
  const q3 = await Item.find({ 'data.genres': { $regex: /romance/i } }).lean()
  console.log('match romance:', q3.map(i=>i.title))
  await mongoose.disconnect()
}
main().catch(e=>{console.error(e); process.exit(1)})
