<?php
require_once('../../models/config.php');

set_error_handler('logAllErrors');
$ajax = true;

// User must be logged in
apiSecurityCheck("get");

$validator = new Validator();

// Add alerts for any failed input validation
foreach ($validator->errors as $error){
  addAlert("danger", $error);
}

if (count($validator->errors) > 0){
    apiReturnError($ajax, getReferralPage());
}
  
// Attempt to load all product statuses
if (!($results = fetchAllProductStatus())){
  //apiReturnError($ajax, getReferralPage());
  addAlert("danger", "No Product Status Found.");
}

restore_error_handler();

echo json_encode($results);
?>
