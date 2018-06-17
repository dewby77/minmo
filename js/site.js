// Retrieve a list of product status
function loadProductStatus() {
    var url = APIPATH + 'product/load_product_status.php';
    var result = $.ajax({
        type: "GET",
        url: url,
        data: {csrf_token: $('input[name="csrf_token"]').val(), ajaxMode: "true"},
        async: false
    }).responseText;
    var data = processJSONResult(result);
    
    if (data['errors'] && data['errors'] > 0){
        handleError();
        return false;
    }    
    
    return data;
}

// Retrieve a list of product status
function loadProductById(productId) {
    var url = APIPATH + 'product/load_product.php';
    var result = $.ajax({
        type: "GET",
        url: url,
        data: {product_id: productId, csrf_token: $('input[name="csrf_token"]').val(), ajaxMode: "true"},
        async: false
    }).responseText;
    var data = processJSONResult(result);
    
    if (data['errors'] && data['errors'] > 0){
        handleError();
        return false;
    }    
    
    return data;
}

//used to handle errors coming back from an ajax request
function handleError(){
    //mccrea - figure out a common way to handle errors - display error to user - log error somehow
    addAlert("danger", "Something did not work correctly.  We will get this fixed as soon as possible!");
    //alertWidget('display-alerts');
}

//used to make parent containers of tables scrollable so mobile view does not become completely smashed
function scrollTable(scrollDiv, inWidth) {
  if($(window).width() < inWidth){
      $(scrollDiv).css("overflow", "auto");
  } else {
      $(scrollDiv).removeAttr("style");
  }            
}