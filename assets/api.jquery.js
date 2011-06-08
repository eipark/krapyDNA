// (c) Copyright 2009 Jaded Pixel. Author: Caroline Schnapp. All Rights Reserved.

/*

IMPORTANT:

Ajax requests that update Shopify's cart must be queued and sent synchronously to the server.
Meaning: you must wait for your 1st ajax callback to send your 2nd request, and then wait
for its callback to send your 3rd request, etc.

*/

/**
 * Modified by Mitchell Amihod 
 *  We make some mods. consider them feedback :) See comments/commit messages
 * Changes include:
 *      addItemFromForm: allow for passing in of form element, OR string selector
 *      updateCartFromForm: allow for passing in of form element, OR string selector
 *
 * To see how I make use of these changes, see [link to ajaxify-shop.js] 
 * 
 * Sept 02, 2010
 */
if ((typeof Shopify) === 'undefined') {
  Shopify = {};
}

/* 

Override so that Shopify.formatMoney returns pretty
money values instead of cents.

*/

Shopify.money_format = '$';

/* 

Events (override!)

Example override:
  ... add to your theme.liquid's script tag....

  Shopify.onItemAdded = function(line_item) {
    $('message').update('Added '+line_item.title + '...');
  }
  
*/

Shopify.onError = function(XMLHttpRequest, textStatus) {
  // Shopify returns a description of the error in XMLHttpRequest.responseText.
  // It is JSON.
  // Example: {"description":"The product 'Amelia - Small' is already sold out.","status":500,"message":"Cart Error"}
  var data = eval('(' + XMLHttpRequest.responseText + ')');
  alert(data.message + '(' + data.status  + '): ' + data.description);
};

Shopify.onCartUpdate = function(cart) {
  alert('There are now ' + cart.item_count + ' items in the cart.');
};  

Shopify.onItemAdded = function(line_item) {
  alert(line_item.title + ' was added to your shopping cart.');
};

Shopify.onProduct = function(product) {
  jQuery("#recently-viewed").css('display', 'block');
  jQuery("#recently-viewed .products").append('<div class="product"><div class="image"><a href="' + product.url + '"><img src="' + Shopify.resizeImage(product.featured_image, 'large') + '" alt="' + product.title + '" /></a></div><div class="details clearfix"><a href="' + product.url + '"><span class="title">' + product.title + '</span></a></div></div>');
  jQuery("#recently-viewed .products .product:nth-child(4)").addClass("last");
  jQuery("#content-slide .product .details, #content-table .product .details").css({opacity:0.0});
};

/* Tools */

/* 
Examples of call:
Shopify.formatMoney(600000, '&euro; EUR')
Shopify.formatMoney(600000, '&euro; EUR')
Shopify.formatMoney(600000, '$')
Shopify.formatMoney(600000, '') in a Liquid template!

In a Liquid template, you have access to a shop money formats with:



All these formats are editable on the Preferences page in your admin.
*/
Shopify.formatMoney = function(cents, format) {
  var value = '';
  var patt = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);
  switch(formatString.match(patt)[1]) {
  case 'amount':
    value = floatToString(cents/100.0, 2).replace(/(\d+)(\d{3}[\.,]?)/,'$1,$2');
    break;
  case 'amount_no_decimals':
    value = floatToString(cents/100.0, 0).replace(/(\d+)(\d{3}[\.,]?)/,'$1,$2');
    break;
  case 'amount_with_comma_separator':
    value = floatToString(cents/100.0, 2).replace(/\./, ',').replace(/(\d+)(\d{3}[\.,]?)/,'$1.$2');
    break;
  }    
  return formatString.replace(patt, value);
};

Shopify.resizeImage = function(image, size) {
  try {
    if(size == 'original') { return image; }
    else {      
      var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + '_' + size + '.' + matches[2];
    }    
  } catch (e) { return image; }
};

/* Ajax API */

// -------------------------------------------------------------------------------------
// POST to cart/add.js returns the JSON of the line item associated with the added item.
// -------------------------------------------------------------------------------------
Shopify.addItem = function(variant_id, quantity, callback) {
  quantity = quantity || 1;
  var params = {
    type: 'POST',
    url: '/cart/add.js',
    data: 'quantity=' + quantity + '&id=' + variant_id,
    dataType: 'json',
    success: function(line_item) { 
      if ((typeof callback) === 'function') {
        callback(line_item);
      }
      else {
        Shopify.onItemAdded(line_item);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/add.js returns the JSON of the line item.
// ---------------------------------------------------------
//Allow use of form element instead of id.
//This makes it a bit more flexible. Every form doesn't need an id.
//Once you are having someone pass in an id, might as well make it selector based, or pass in the element itself.
//Since you are just wrapping it in a jq(). The same rationale is behind the change for updateCartFromForm
//@param HTMLElement the form element which was submitted. Or you could pass in a string selector such as the form id. 
//@param function callback callback fuction if you like, but I just override Shopify.onItemAdded() instead
Shopify.addItemFromForm = function(form, callback) {
    var params = {
      type: 'POST',
      url: '/cart/add.js',
      data: jQuery(form).serialize(),
      dataType: 'json',
      success: function(line_item) { 
        if ((typeof callback) === 'function') {
          callback(line_item, form);
        }
        else {
          Shopify.onItemAdded(line_item, form);
        }
      },
      error: function(XMLHttpRequest, textStatus) {
        Shopify.onError(XMLHttpRequest, textStatus);
        jQuery("#cart-updated").html("<a href='#'>Product is sold out!</a>");
        var tempwidth = jQuery(".cart-summary").outerWidth();
        jQuery('#cart-updated').css({'left': '100%', 'margin-left':'-'+ tempwidth +'px', 'width': tempwidth+'px'})
        jQuery('#cart-updated').fadeIn(200).delay(2000).fadeOut(400);
        
        window.setTimeout(function() {
        jQuery("#add-to-cart").val("Add to Cart").animate({
            
                color: '#ffffff',
                backgroundColor: '#000000'
            
            }, 400);
        }, 2200);
      }
    };
    jQuery.ajax(params);
};

// ---------------------------------------------------------
// GET cart.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.getCart = function(callback) {
  jQuery.getJSON('/cart.js', function (cart, textStatus) {
    if ((typeof callback) === 'function') {
      callback(cart);
    }
    else {
      Shopify.onCartUpdate(cart);
    }
  });
};

// ---------------------------------------------------------
// GET products/<product-handle>.js returns the product in JSON.
// ---------------------------------------------------------
Shopify.getProduct = function(handle, callback) {
  jQuery.getJSON('/products/' + handle + '.js', function (product, textStatus) {
    if ((typeof callback) === 'function') {
      callback(product);
    }
    else {
      Shopify.onProduct(product);
    }
  });
};

// ---------------------------------------------------------
// POST to cart/change.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.changeItem = function(variant_id, quantity, callback) {
  var params = {
    type: 'POST',
    url: '/cart/change.js',
    data:  'quantity='+quantity+'&id='+variant_id,
    dataType: 'json',
    success: function(cart) { 
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/change.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.removeItem = function(variant_id, callback) {
  var params = {
    type: 'POST',
    url: '/cart/change.js',
    data:  'quantity=0&id='+variant_id,
    dataType: 'json',
    success: function(cart) { 
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/clear.js returns the cart in JSON.
// It removes all the items in the cart, but does
// not clear the cart attributes nor the cart note.
// ---------------------------------------------------------
Shopify.clear = function(callback) {
  var params = {
    type: 'POST',
    url: '/cart/clear.js',
    data:  '',
    dataType: 'json',
    success: function(cart) { 
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// ---------------------------------------------------------
//Allow use of form element instead of id.
//This makes it a bit more flexible. Every form doesn't need an id.
//Once you are having someone pass in an id, might as well make it selector based, or pass in the element itself, 
//since you are just wrapping it in a jq().
//@param HTMLElement the form element which was submitted. Or you could pass in a string selector such as the #form_id. 
//@param function callback callback fuction if you like, but I just override Shopify.onCartUpdate() instead
Shopify.updateCartFromForm = function(form, callback) {
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: jQuery(form).serialize(),
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart, form);
      }
      else {
        Shopify.onCartUpdate(cart, form);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// To clear a particular attribute, set its value to an empty string.
// Receives attributes as a hash or array. Look at comments below.
// ---------------------------------------------------------
Shopify.updateCartAttributes = function(attributes, callback) {
  var data = '';
  // If attributes is an array of the form:
  // [ { key: 'my key', value: 'my value' }, ... ]
  if (jQuery.isArray(attributes)) {
    jQuery.each(attributes, function(indexInArray, valueOfElement) {
      var key = attributeToString(valueOfElement.key);
      if (key !== '') {
        data += 'attributes[' + key + ']=' + attributeToString(valueOfElement.value) + '&';
      }
    });
  }
  // If attributes is a hash of the form:
  // { 'my key' : 'my value', ... }
  else if ((typeof attributes === 'object') && attributes !== null) {
    jQuery.each(attributes, function(key, value) {
        data += 'attributes[' + attributeToString(key) + ']=' + attributeToString(value) + '&';
    });
  }
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: data,
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.updateCartNote = function(note, callback) {
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: 'note=' + attributeToString(note),
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

/* Used by Tools */

function floatToString(numeric, decimals) {
  var amount = numeric.toFixed(decimals).toString();
  if(amount.match(/^\.\d+/)) {return "0"+amount; }
  else { return amount; }
}

/* Used by API */

function attributeToString(attribute) {
  if ((typeof attribute) !== 'string') {
    // Converts to a string.
    attribute += '';
    if (attribute === 'undefined') {
      attribute = '';
    }
  }
  // Removing leading and trailing whitespace.
  return jQuery.trim(attribute);
}