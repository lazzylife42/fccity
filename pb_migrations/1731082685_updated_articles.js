/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kupsl4nnsnt1vd0")

  // remove
  collection.schema.removeField("mdfcwlsy")

  // remove
  collection.schema.removeField("ebuwv2kh")

  // remove
  collection.schema.removeField("jitjuakw")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zhctclmb",
    "name": "kids",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ucxwi5nn",
    "name": "adult",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kupsl4nnsnt1vd0")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mdfcwlsy",
    "name": "discount",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 99,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ebuwv2kh",
    "name": "description",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jitjuakw",
    "name": "margin",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 9999,
      "noDecimal": false
    }
  }))

  // remove
  collection.schema.removeField("zhctclmb")

  // remove
  collection.schema.removeField("ucxwi5nn")

  return dao.saveCollection(collection)
})
