migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kupsl4nnsnt1vd0")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "789gpxrv",
    "name": "Short_Team_Rise",
    "type": "select",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 10,
      "values": [
        "116",
        "128",
        "140",
        "152",
        "164",
        "176",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "Taille 1 (31/34)",
        "Taille 2 (35/38)",
        "Taille 3 (39/42)",
        "Taille 4 (43/45)"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kupsl4nnsnt1vd0")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "789gpxrv",
    "name": "Short_Team_Rise",
    "type": "select",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 10,
      "values": [
        "128",
        "140",
        "152",
        "164",
        "176",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "Taille 1 (31/34)",
        "Taille 2 (35/38)",
        "Taille 3 (39/42)",
        "Taille 4 (43/45)"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
