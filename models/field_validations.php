<?php

function validateProduct($product) {
    $min = 1;
    $max = 250;
    
    if(!checkMinMaxString("Product Name", $product->product_name, $min, $max)) {
        return false;
    }
    
    //we do not have description next - just another example
    //$min = 1;
    //$max = 500;
    //if(!checkMinMaxString("Product Description", $product->product_desc, $min, $max)){
    //    return false;
    //}
    
    return true;
}

function checkMinMaxString($field_name, $value, $min, $max){
    if ($value != null && strlen($value) > 0) {
        if(minMaxRange($min, $max, $value)){
            addAlert("danger", $field_name." must be greater than ".$min." and less than ".$max." characters.");
            return false;
        }
    } else {
        addAlert("danger", $field_name." must be greater than ".$min." and less than ".$max." characters.");
        return false;      
    }
    
    return true;
}
