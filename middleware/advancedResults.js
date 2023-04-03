const advancedResults = (model, populate='') => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };
  console.log("body===",req.body);

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // if(req.body.search){
  //    let search = {}
  //   const {averageCost ,city } = req.body.search;

  //   if(averageCost){
  //     search.averageCost = {
  //       "$lte" : averageCost.max,
  //       "$gte" : averageCost.min
  //     }
  //   }

  //   if(city){
  //     search.city = city;
  //   }

  //   queryStr = JSON.stringify(search);

  // }

  //console.log("queryStr",queryStr)

  // Finding resource
  query = model.find(JSON.parse(queryStr));

 

  // Sort
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  //working
  // if(req.body.sort){
  //   const {field,order} = req.body.sort;
  //   query = query.sort({[field]: order});
  // }else{
  //   query = query.sort('-createdAt');
  // }

  // Pagination
  const page = parseInt(req.body.page, 10) || 1;
  const limit = parseInt(req.body.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  //const total = await model.countDocuments();
  const total = await model.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

   // Select Fields
   if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1
    };
  }

  res.advancedResults = {
    status: true,
    statusCode:200,
    //count: results.length,
    pagination:{
      total,
      limit,
      page,
    },
    data: results
  };

  next();
};

module.exports = advancedResults;
