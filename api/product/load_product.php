<?php
require_once('../../models/config.php');

set_error_handler('logAllErrors');
$ajax = true;

// User must be logged in
apiSecurityCheck("get");

$validator = new Validator();
$product_id = $validator->requiredGetVar('product_id');

// Add alerts for any failed input validation
foreach ($validator->errors as $error){
  addAlert("danger", $error);
}

if (count($validator->errors) > 0){
    apiReturnError($ajax, getReferralPage());
}
  
// Retrieve the product by id
if (!($results = fetchProductById($loggedInUser->user_id, $product_id))){
  //apiReturnError($ajax, getReferralPage()); -- we do not necessarily have to error but it would be an odd case
}

restore_error_handler();

echo json_encode($results);
?>
