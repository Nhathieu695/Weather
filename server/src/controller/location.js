const { text } = require('express');
const Cities = require('../models/cities');

const location = {
    getlocation: async (req, res) => {
        try {
            const query = req.query.queries;

            const agg = [
                {
                    $search: {
                        text: {
                            query: query,
                            path: "city",
                        },
                    },
                },
                {
                    $limit: 10,
                },

            ];
            const data = await Cities.aggregate(agg);
            console.log("check data", data)
            res.status(200).json(
                {
                    data: data
                }
            );
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "An error occurred while retrieving data",
            });
        }
    },
};

module.exports = location;