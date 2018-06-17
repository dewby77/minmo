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
$product_name = trim($validator->requiredPostVar('product_name'));
$product_number = trim($validator->optionalPostVar('product_number'));
$product_desc = trim($validator->requiredPostVar('product_desc'));
$product_status_id = $validator->requiredPostVar('product_status_id');
$hidden_product_img = $validator->optionalPostVar('hidden_product_img');

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

$no_files = false;
$new_name = "";

if (empty($_FILES['product_image'])) {
    $no_files = true;
    
    $new_name = $hidden_product_img;
}
 
// get the files posted - should only be one
if(!$no_files){
    $images = $_FILES['product_image'];

    $ext = explode('.', basename($images['name']));
    $new_name = md5(uniqid()) . "." . array_pop($ext);  
}

$product = initProduct($product_id, $product_number, $product_name, $new_name, $product_status_id);

if (updateProduct($product)){
    $success_count++;
} else {
    $error_count++;
}

if($success_count > 0 && !$no_files){
    $static_target = '..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'product_img'.DIRECTORY_SEPARATOR.$product_id;
    if (!file_exists($static_target)) {
        mkdir($static_target, 0774, true);
    }  else {
        //delete the previous image
        foreach(glob($static_target.'/*.*') as $file) {
            if(is_file($file)) {
               unlink($file);  
            }                   
        }     
    }
    
    $target = $static_target . DIRECTORY_SEPARATOR . $new_name;
    
    if(move_uploaded_file($images['tmp_name'], $target)) {
        addAlert("success", "Product Saved Successfully!");
    } else{
        $error_count++;
        addAlert("success", "Product Saved Successfully but there was an issue saving the new image!");
    }     
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


