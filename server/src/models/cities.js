const mongoose = require('mongoose');
const CitiesSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    city: {
        type: String
    },
    city_ascii: {
        type: String
    },
    lat: {
        type: mongoose.Types.Decimal128
    },
    lng: {
        type: mongoose.Types.Decimal128
    },
    country: {
        type: String
    },
    iso2: {
        type: String
    },
    iso3: {
        type: String
    },
    admin_name: {
        type: String
    },
    capital: {
        type: String
    },
    population: {
        typeL: String
    },
    state_id: {
        typeL: Number
    }
});
const Cities = mongoose.model("Cities", CitiesSchema, "Cities");
module.exports = Cities;