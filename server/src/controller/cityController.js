const aqp = require("api-query-params");
const Cities = require("../models/cities");

const cityController = {
    findAll: async (req, res) => {
        try {
            const { filter, skip, sort, population } = aqp(req.query);
            const CurrentPage = parseInt(req.query.CurrentPage, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const searchQuery = req.query.query;


            delete filter.CurrentPage;
            delete filter.limit;


            if (searchQuery) {
                filter.city = { $regex: searchQuery, $options: "i" };
            }

            // Tính toán offset và limit
            const offset = (CurrentPage - 1) * limit;
            const defaultLimit = limit || 10;

            // Tổng số bản ghi
            const totalItems = await Cities.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / defaultLimit);

            // Query danh sách thành phố
            const result = await Cities.find(filter)
                .skip(offset)
                .limit(defaultLimit)
                .sort(sort)
                .populate(population)
                .exec();

            return res.status(200).json({
                meta: {
                    current: CurrentPage,
                    pageSize: limit,
                    pages: totalPages,
                    total: totalItems,
                },
                result, // Kết quả query
            });
        } catch (error) {
            console.error("Error in findAll:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = cityController;
