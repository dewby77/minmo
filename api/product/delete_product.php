<?php

require_once("../../models/config.php");
set_error_handler('logAllErrors');

if (!isUserLoggedIn()){
    addAlert("danger", "You must be logged in to access this resource.");
    echo json_encode(array("errors" => 1, "successes" => 0));
    exit();
}

$validator = new Validator();

$csrf_token = $validator->requiredPostVar('csrf_token');
$product_id = $validator->requiredPostVar('product_id');

// Add alerts for any failed input validation
foreach ($validator->errors as $error){
  addAlert("danger", $error);
}

// Validate csrf token
if (!$csrf_token or !$loggedInUser->csrf_validate(trim($csrf_token))){
    addAlert("danger", lang("ACCESS_DENIED"));
    echo json_encode(array("errors" => 1, "successes" => 0));
    exit();
}

$error_count = 0;
$success_count = 0;


if (deleteProduct($product_id)){
    addAlert("success", "Product Deleted Successfully!");
    $success_count++;
} else {
    $error_count++;
}

restore_error_handler();

$ajaxMode = $validator->optionalBooleanPostVar('ajaxMode', 'true');
if ($ajaxMode == "true" ){
  echo json_encode(array(
	"errors" => $error_count,
	"successes" => $success_count));
} else {
  header('Location: ../../secure/index.php');
  exit();
}

?>


