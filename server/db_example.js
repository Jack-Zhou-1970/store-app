

db_query_all_product(function(err, result) {
  if (err) {
    console.log("query All fail");
  } else {
    console.log("query All success");
    console.log(result);
  }
});

db_insert_product(my_db_data.product, function(err, result) {
  if (err) {
    console.log("insert fail");
  } else {
    console.log("insert success");
  }
});

db_deleteAll_product(function(err, result) {
  if (err) {
    console.log("delete All fail");
  } else {
    console.log("delete All success");
  }
});