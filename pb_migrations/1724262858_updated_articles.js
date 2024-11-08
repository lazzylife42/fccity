/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kupsl4nnsnt1vd0")

  // update
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

  // update
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kupsl4nnsnt1vd0")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mdfcwlsy",
    "name": "discount",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jitjuakw",
    "name": "margin",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
})
