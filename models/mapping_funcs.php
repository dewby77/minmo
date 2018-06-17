<?php

function initProduct($product_id, $product_number, $product_name, $product_img, $product_status_id){
    $product = new Product();
    $product->product_id = $product_id;
    $product->product_number = $product_number;
    $product->product_name = $product_name;
    $product->product_img = $product_img;
    $product->product_status_id = $product_status_id;
    
    return $product;
}

