$(document).ready(function(){

  // hacky sidebar logic, precompute URLs on server side and select one
  var sidebar_images = 3;
  var sidebar_url_array = new Array();
  sidebar_url_array[0] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar1.jpg?104244';
  sidebar_url_array[1] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar2.jpg?104244';
  sidebar_url_array[2] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar3.jpg?104244';
  sidebar_url_array[3] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar4.jpg?104244';
  sidebar_url_array[4] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar5.jpg?104244';
  sidebar_url_array[5] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar6.jpg?104244';
  sidebar_url_array[6] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar7.jpg?104244';
  sidebar_url_array[7] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar8.jpg?104244';
  sidebar_url_array[8] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar9.jpg?104244';
  sidebar_url_array[9] = 'http://cdn.shopify.com/s/files/1/0070/6762/t/1/assets/sidebar10.jpg?104244';
  sidebar_images = Math.floor(Math.random()*1000) % sidebar_images;
  var sidebar_url = sidebar_url_array[sidebar_images];

	$(".newsletter-link").click(function(){
		$("#newsletter-box").show();
	});

	$("#newsletter-close").click(function(){
		$("#newsletter-box").hide();
	});

	$("#sidebar-image").attr("src", sidebar_url);

});