export interface PaginationOptions {
    page?: number;
    perPage?: number;
}

export function paginate({page = 1, perPage = 10}: PaginationOptions) {
    const skip = (page - 1) * perPage;

    return [
        {
            $facet: {
                data: [
                    {$skip: skip},
                    {$limit: perPage}
                ],
                meta: [
                    {$count: "totalDocs"}
                ]
            }
        },
        {
            $addFields: {
                totalDocs: {$arrayElemAt: ["$meta.totalDocs", 0]},
                totalPages: {
                    $ceil: {
                        $divide: [
                            {$arrayElemAt: ["$meta.totalDocs", 0]},
                            perPage
                        ]
                    }
                },
                hasNextPage: {
                    $gt: [
                        {
                            $arrayElemAt: ["$meta.totalDocs", 0]
                        },
                        page * perPage
                    ]
                },
                hasPrevPage: {
                    $gt: [page, 1]
                }
            }
        },
        {
            $project: {
                data: 1,
                metaData: {
                    totalDocs: "$totalDocs",
                    totalPages: "$totalPages",
                    hasNextPage: "$hasNextPage",
                    hasPrevPage: "$hasPrevPage",
                    page: {$literal: page},
                    perPage: {$literal: perPage}
                }
            }
        }
    ];
}
