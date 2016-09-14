$body = $("body");

$(document).ready(function(){
  $(".loading").show();

  $("#process").click(function(e){
      e.preventDefault();
      $.ajax({type: "POST",
              url: "/report",
              dataType: 'json',
              data: { text: $("#virginiain").val() },
              success:function(result){
                $(".loading").show();
                $("#report").replaceWith('<object id="report" data="'+ result.url + '" type="application/pdf"></object>');
                //$("#virginiain").val('')
                setTimeout(function () {
                  $(".loading").hide();
                }, 3000);
              },
              error: function(xhr, status, error) {
                alert('Error');
              }});
      });

  $('[data-popup-open]').on('click', function(e)  {
      var targeted_popup_class = jQuery(this).attr('data-popup-open');
      $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);

      e.preventDefault();
  });

  $('[data-popup-close]').on('click', function(e)  {
      var targeted_popup_class = jQuery(this).attr('data-popup-close');
      $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);

      e.preventDefault();
  });

  $("#webcam").scriptcam({
       path: '/scripts/scriptcam/',
       width: 640,
       height: 480,
       useMicrophone: false
   });

});

$(document).on({
     ajaxStart: function() { $(".loading").show(); },
     ajaxStop: function() { $(".loading").hide(); }
});

jQuery(window).load(function () {
  setTimeout(function () {
    $(".loading").hide();
  }, 3000);
});
